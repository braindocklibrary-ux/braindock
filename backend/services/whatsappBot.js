import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, '..', 'data', 'baileys_auth');

class WhatsAppBotService {
  constructor() {
    this.sock = null;
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
    this.qrCodeDataUrl = null;
    this.rawQrString = null;
    this.connectedNumber = null;
    this.lastConnectedAt = null;
    this.reconnectAttempts = 0;
    this.isInitializing = false;
  }

  // Get current bot state
  getStatus() {
    return {
      status: this.status,
      qrCodeDataUrl: this.qrCodeDataUrl,
      connectedNumber: this.connectedNumber,
      lastConnectedAt: this.lastConnectedAt
    };
  }

  // Initialize or resume WhatsApp connection
  async initWhatsAppBot() {
    if (this.isInitializing || this.status === 'connected') {
      return this.getStatus();
    }

    this.isInitializing = true;
    this.status = 'connecting';

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Brain Dock Library', 'Desktop', '1.0.0']
      });

      this.sock.ev.on('creds.update', saveCreds);

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
          console.log(`[WhatsApp Bot] Connected successfully! Linked Number: ${this.connectedNumber}`);
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`[WhatsApp Bot] Connection closed. Reason: ${statusCode}, Should Reconnect: ${shouldReconnect}`);

          if (statusCode === DisconnectReason.loggedOut) {
            this.status = 'disconnected';
            this.connectedNumber = null;
            this.qrCodeDataUrl = null;
            this.cleanAuthDir();
          } else if (shouldReconnect) {
            this.status = 'connecting';
            this.reconnectAttempts++;
            const delay = Math.min(this.reconnectAttempts * 2000, 10000);
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

  // Disconnect & logout cleanly
  async disconnectWhatsAppBot() {
    try {
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (e) {}
        this.sock.end(undefined);
      }
    } catch (err) {
      console.warn('[WhatsApp Bot] Disconnect warning:', err.message);
    } finally {
      this.sock = null;
      this.status = 'disconnected';
      this.qrCodeDataUrl = null;
      this.connectedNumber = null;
      this.lastConnectedAt = null;
      this.cleanAuthDir();
    }
    return { success: true, message: 'WhatsApp bot disconnected and session reset.' };
  }

  // Wipe auth directory
  cleanAuthDir() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
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
