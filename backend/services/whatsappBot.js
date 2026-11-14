import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WhatsAppSession, WhatsAppBotLock } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, '..', 'data', 'baileys_auth');

// Distinguish between Local Library PC and Cloud Container (Render)
const isCloudServer = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
const INSTANCE_TYPE = isCloudServer ? 'render' : 'local';
const INSTANCE_ID = `${INSTANCE_TYPE}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

class WhatsAppBotService {
  constructor() {
    this.sock = null;
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'standby'
    this.qrCodeDataUrl = null;
    this.rawQrString = null;
    this.connectedNumber = null;
    this.lastConnectedAt = null;
    this.reconnectAttempts = 0;
    this.isInitializing = false;
    this._syncTimeout = null;
    this._heartbeatInterval = null;
    this._autoSyncInterval = null;
    this.isMaster = false;
  }

  // Get current bot state
  getStatus() {
    return {
      status: this.status,
      qrCodeDataUrl: this.qrCodeDataUrl,
      connectedNumber: this.connectedNumber,
      lastConnectedAt: this.lastConnectedAt,
      isMaster: this.isMaster,
      instanceType: INSTANCE_TYPE
    };
  }

  // Restore session credentials from MongoDB Atlas into local container
  async restoreAuthFromMongo() {
    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const docs = await WhatsAppSession.find({}).lean();
      if (docs && docs.length > 0) {
        console.log(`[WhatsApp Bot] 🔄 Restoring ${docs.length} session credentials from MongoDB Atlas into local storage...`);
        for (const doc of docs) {
          try {
            const filePath = path.join(AUTH_DIR, doc.key);
            fs.writeFileSync(filePath, doc.data, 'utf-8');
          } catch (e) {}
        }
        console.log(`[WhatsApp Bot] ✅ Session credentials restored from MongoDB Atlas successfully.`);
      }
    } catch (err) {
      console.warn('[WhatsApp Bot] MongoDB session restore notice:', err.message);
    }
  }

  // Persist session credentials into MongoDB Atlas
  async syncAuthToMongo() {
    try {
      if (!fs.existsSync(AUTH_DIR)) return;
      const files = fs.readdirSync(AUTH_DIR);
      if (!files || files.length === 0) return;

      const ops = files.map(file => {
        try {
          const filePath = path.join(AUTH_DIR, file);
          const data = fs.readFileSync(filePath, 'utf-8');
          return {
            updateOne: {
              filter: { key: file },
              update: { $set: { key: file, data } },
              upsert: true
            }
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      if (ops.length > 0) {
        await WhatsAppSession.bulkWrite(ops, { ordered: false });
      }
    } catch (err) {
      console.warn('[WhatsApp Bot] MongoDB session sync notice:', err.message);
    }
  }

  debouncedMongoSync() {
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => {
      this.syncAuthToMongo().catch(() => {});
    }, 1000);
  }

  // Check and update Distributed Leader Lock to prevent Localhost & Render dual-connection collision
  async checkLeaderLock() {
    try {
      const lock = await WhatsAppBotLock.findById('active_bot_master').lean();
      const now = Date.now();
      const isLockRecent = lock && lock.heartbeatAt && (now - new Date(lock.heartbeatAt).getTime() < 40000);

      if (INSTANCE_TYPE === 'render') {
        // Render yields whenever the Library Local PC is active
        if (isLockRecent && lock.holder === 'local') {
          if (this.sock) {
            console.log('[WhatsApp Bot] 💤 Library Local PC active as WhatsApp Master. Render yielding socket.');
            try {
              this.sock.ev.removeAllListeners();
              this.sock.end(undefined);
            } catch (e) {}
            this.sock = null;
          }
          this.isMaster = false;
          this.status = 'standby';
          return false;
        }
      }

      // Claim or renew lock
      await WhatsAppBotLock.findOneAndUpdate(
        { _id: 'active_bot_master' },
        {
          holder: INSTANCE_TYPE,
          instanceId: INSTANCE_ID,
          heartbeatAt: new Date()
        },
        { upsert: true }
      );

      this.isMaster = true;
      return true;
    } catch (e) {
      // If MongoDB lock check fails, allow local PC to proceed
      if (INSTANCE_TYPE === 'local') return true;
      return false;
    }
  }

  startHeartbeat() {
    if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    this._heartbeatInterval = setInterval(async () => {
      const allowed = await this.checkLeaderLock();
      if (!allowed && this.sock) {
        console.log('[WhatsApp Bot] 🛑 Lost leader lock. Putting socket into standby.');
        try {
          this.sock.ev.removeAllListeners();
          this.sock.end(undefined);
        } catch (e) {}
        this.sock = null;
        this.status = 'standby';
      }
    }, 15000);

    if (this._autoSyncInterval) clearInterval(this._autoSyncInterval);
    this._autoSyncInterval = setInterval(() => {
      if (this.status === 'connected' || this.status === 'qr_ready') {
        this.syncAuthToMongo().catch(() => {});
      }
    }, 5000);
  }

  // Initialize or resume WhatsApp connection
  async initWhatsAppBot() {
    if (this.isInitializing || this.status === 'connected') {
      return this.getStatus();
    }

    // Check distributed leader lock first
    const canConnect = await this.checkLeaderLock();
    if (!canConnect) {
      console.log(`[WhatsApp Bot] ℹ️ Instance (${INSTANCE_TYPE}) is in STANDBY mode to prevent socket collisions.`);
      return this.getStatus();
    }

    this.isInitializing = true;
    this.status = 'connecting';
    this.startHeartbeat();

    try {
      // 1. Ensure local folder is populated with cloud credentials from MongoDB Atlas
      await this.restoreAuthFromMongo();

      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      // Safely close any previous zombie socket
      if (this.sock) {
        try {
          this.sock.ev.removeAllListeners();
          this.sock.end(undefined);
        } catch (e) {}
        this.sock = null;
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        // Use standard official Ubuntu Chrome browser signature so WhatsApp anti-bot AI never revokes pairing
        browser: ['Ubuntu', 'Chrome', '22.04.4'],
        keepAliveIntervalMs: 25000, // 25s keepalive ping
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        syncFullHistory: false, // Prevents loading heavy old chats (RAM safe)
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        retryRequestDelayMs: 2000,
        maxMsgRetryCount: 3
      });

      this.sock.ev.on('creds.update', async () => {
        await saveCreds();
        this.debouncedMongoSync();
      });

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.rawQrString = qr;
          try {
            this.qrCodeDataUrl = await qrcode.toDataURL(qr, {
              margin: 2,
              scale: 6,
              color: {
                dark: '#2E1065', // Royal purple QR dots
                light: '#FFFFFF'
              }
            });
            this.status = 'qr_ready';
          } catch (err) {
            console.error('[WhatsApp Bot] QR render error:', err);
          }
        }

        if (connection === 'open') {
          this.status = 'connected';
          this.qrCodeDataUrl = null;
          this.rawQrString = null;
          this.reconnectAttempts = 0;
          this.lastConnectedAt = new Date().toISOString();

          let num = 'Library Official';
          if (this.sock.user?.id) {
            const rawId = this.sock.user.id.split(':')[0].replace(/\D/g, '');
            num = rawId.length >= 10 ? `+${rawId}` : rawId;
          }
          this.connectedNumber = num;
          console.log(`[WhatsApp Bot] 🟢 Connected successfully! Linked Number: ${this.connectedNumber} (Host: ${INSTANCE_TYPE})`);

          // Persist full auth state to MongoDB Atlas immediately
          this.syncAuthToMongo().catch(() => {});
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;
          const shouldReconnect = !isLoggedOut;

          console.log(`[WhatsApp Bot] Connection closed. Reason: ${statusCode}, Should Reconnect: ${shouldReconnect}`);

          // Dismantle previous socket
          if (this.sock) {
            try {
              this.sock.ev.removeAllListeners();
              this.sock.end(undefined);
            } catch (e) {}
            this.sock = null;
          }

          if (isLoggedOut) {
            // Note: DO NOT call cleanAuthDir() here! 
            // Automatic wiping on temporary glitches destroys valid sessions.
            // Credentials are ONLY wiped when the owner clicks "Unlink" in the dashboard.
            this.status = 'disconnected';
            this.connectedNumber = null;
            this.qrCodeDataUrl = null;
            console.log('[WhatsApp Bot] ⚠️ Connection logged out or replaced. Keeping keys intact for manual re-link.');
          } else if (shouldReconnect) {
            this.status = 'connecting';
            this.reconnectAttempts++;
            const delay = Math.min(this.reconnectAttempts * 2500, 15000);
            console.log(`[WhatsApp Bot] 🔄 Reconnecting attempt #${this.reconnectAttempts} in ${delay / 1000}s...`);
            setTimeout(() => {
              this.isInitializing = false;
              this.initWhatsAppBot();
            }, delay);
          } else {
            this.status = 'disconnected';
          }
        }
      });

    } catch (err) {
      console.error('[WhatsApp Bot] Init error:', err);
      this.status = 'disconnected';
    } finally {
      this.isInitializing = false;
    }

    return this.getStatus();
  }

  // Disconnect & logout cleanly (Triggered ONLY by owner clicking "Unlink" button)
  async disconnectWhatsAppBot() {
    try {
      if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
      if (this._autoSyncInterval) clearInterval(this._autoSyncInterval);
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (e) {}
        try {
          this.sock.ev.removeAllListeners();
          this.sock.end(undefined);
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[WhatsApp Bot] Disconnect warning:', err.message);
    } finally {
      this.sock = null;
      this.status = 'disconnected';
      this.qrCodeDataUrl = null;
      this.connectedNumber = null;
      this.lastConnectedAt = null;
      this.isMaster = false;
      await this.cleanAuthDir();
      await WhatsAppBotLock.deleteMany({}).catch(() => {});
    }
    return { success: true, message: 'WhatsApp bot disconnected and session reset.' };
  }

  // Wipe auth directory and cloud credentials
  async cleanAuthDir() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
      await WhatsAppSession.deleteMany({}).catch(() => {});
      console.log('[WhatsApp Bot] 🧹 Auth credentials wiped from disk and MongoDB Atlas.');
    } catch (e) {
      console.warn('[WhatsApp Bot] Could not wipe auth dir:', e.message);
    }
  }

  // Format phone number to WhatsApp JID (e.g. 919876543210@s.whatsapp.net)
  formatJid(phoneNumber) {
    if (!phoneNumber) return null;
    let clean = String(phoneNumber).replace(/\D/g, '');
    if (clean.length === 10) {
      clean = `91${clean}`;
    }
    return `${clean}@s.whatsapp.net`;
  }

  // Send single text message directly via linked WhatsApp session
  async sendTextMessage(toPhone, messageText) {
    if (this.status !== 'connected' || !this.sock) {
      return {
        success: false,
        error: 'WhatsApp bot is not connected. Please scan QR code in Admin Panel.'
      };
    }

    const jid = this.formatJid(toPhone);
    if (!jid) {
      return { success: false, error: 'Invalid recipient phone number.' };
    }

    try {
      const result = await this.sock.sendMessage(jid, { text: messageText });
      return {
        success: true,
        messageId: result?.key?.id,
        recipient: jid
      };
    } catch (err) {
      console.error(`[WhatsApp Bot] Failed sending to ${jid}:`, err);
      return {
        success: false,
        error: err.message || 'Failed sending WhatsApp message.'
      };
    }
  }
}

// Singleton instance
export const whatsAppBot = new WhatsAppBotService();
export default whatsAppBot;
