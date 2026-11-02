import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import whatsAppBot from './whatsappBot.js';
import { store } from '../data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'whatsapp_scheduler_settings.json');

class ExpirySchedulerService {
  constructor() {
    this.cronTask = null;
    this.isDispatching = false;
    this.settings = this.loadSettings();
  }

  loadSettings() {
    const defaults = {
      autoDispatchEnabled: true,
      dispatchHour: 9,      // 09:00 AM default
      dispatchMinute: 30,   // 09:30 AM default
      dispatchTimeString: '09:30',
      delayBetweenMsgsSec: 4, // 4 seconds delay to avoid WhatsApp spam triggers
      lastDispatchedDate: null,
      recentDispatches: []
    };

    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return { ...defaults, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[Expiry Scheduler] Could not read settings file, using defaults:', e.message);
    }
    return defaults;
  }

  saveSettings() {
    try {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Expiry Scheduler] Error saving settings:', e);
    }
  }

  getSettings() {
    return {
      ...this.settings,
      botStatus: whatsAppBot.getStatus()
    };
  }

  updateSettings(updates) {
    if (typeof updates.autoDispatchEnabled === 'boolean') {
      this.settings.autoDispatchEnabled = updates.autoDispatchEnabled;
    }
    if (updates.dispatchTimeString) {
      this.settings.dispatchTimeString = updates.dispatchTimeString;
      const [h, m] = updates.dispatchTimeString.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        this.settings.dispatchHour = h;
        this.settings.dispatchMinute = m;
      }
    }
    if (updates.delayBetweenMsgsSec) {
      this.settings.delayBetweenMsgsSec = Math.max(2, Number(updates.delayBetweenMsgsSec));
    }

    this.saveSettings();
    this.restartCronJob();
    return this.getSettings();
  }

  // Initialize background cron scheduler
  startScheduler() {
    this.restartCronJob();
    console.log(`[Expiry Scheduler] Initialized. Auto-dispatch time: ${this.settings.dispatchTimeString} (Active: ${this.settings.autoDispatchEnabled})`);
  }

  restartCronJob() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }

    // Run cron every minute to check if exact time has been reached
    this.cronTask = cron.schedule('* * * * *', async () => {
      await this.checkAndRunScheduledDispatch();
    });
  }

  // Minute-by-minute evaluation
  async checkAndRunScheduledDispatch() {
    if (!this.settings.autoDispatchEnabled || this.isDispatching) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    // Check if time matches and haven't already dispatched today
    if (
      currentHour === this.settings.dispatchHour &&
      currentMinute === this.settings.dispatchMinute &&
      this.settings.lastDispatchedDate !== todayStr
    ) {
      console.log(`[Expiry Scheduler] Auto-dispatch time reached (${this.settings.dispatchTimeString}). Initiating dispatch batch...`);
      await this.executeDispatchBatch({ isManualTrigger: false });
    }
  }

  // Execute full automated batch for due students
  async executeDispatchBatch({ isManualTrigger = false } = {}) {
    if (this.isDispatching) {
      return { success: false, message: 'A dispatch batch is already in progress.' };
    }

    const botState = whatsAppBot.getStatus();
    if (botState.status !== 'connected') {
      console.warn('[Expiry Scheduler] Cannot run auto-dispatch: WhatsApp bot is not connected!');
      return {
        success: false,
        message: 'WhatsApp bot is not connected. Please scan QR Code in the Admin Panel.',
        botStatus: botState.status
      };
    }

    this.isDispatching = true;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const results = [];

    try {
      // Fetch current expiry reminders list
      const expiries = store.getUpcomingExpiries ? store.getUpcomingExpiries() : [];
      // Filter students whose membership expires in <= 3 days (or expired) and haven't received today's notice
      const dueStudents = expiries.filter(item => !item.alreadySentToday);

      console.log(`[Expiry Scheduler] Found ${dueStudents.length} student(s) due for renewal notice today.`);

      for (let i = 0; i < dueStudents.length; i++) {
        const item = dueStudents[i];
        const studentFee = item.renewalFee || 999;
        const offerNote = item.offerNote || '';

        // Generate personalized text message
        const messageText = store.buildExpiryReminderMessage({
          studentName: item.studentName,
          seatNumber: item.seatNumber,
          shift: item.shift,
          endDate: item.endDate,
          daysRemaining: item.daysRemaining,
          renewalFee: studentFee,
          offerNote
        });

        // Send via linked WhatsApp session
        const sendResult = await whatsAppBot.sendTextMessage(item.studentPhone, messageText);

        if (sendResult.success) {
          // Record successful dispatch in admission store
          store.sendExpiryReminder(item.admissionId, studentFee, offerNote);
          results.push({
            admissionId: item.admissionId,
            studentName: item.studentName,
            seatNumber: item.seatNumber,
            phone: item.studentPhone,
            status: 'Delivered',
            messageId: sendResult.messageId
          });
          console.log(`[Expiry Scheduler] (${i + 1}/${dueStudents.length}) Sent to ${item.studentName} (Seat #${item.seatNumber})`);
        } else {
          results.push({
            admissionId: item.admissionId,
            studentName: item.studentName,
            seatNumber: item.seatNumber,
            phone: item.studentPhone,
            status: 'Failed',
            error: sendResult.error
          });
          console.warn(`[Expiry Scheduler] (${i + 1}/${dueStudents.length}) Failed sending to ${item.studentName}:`, sendResult.error);
        }

        // Throttle delay between messages to protect number from spam detection
        if (i < dueStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.settings.delayBetweenMsgsSec * 1000));
        }
      }

      // Mark today as dispatched if scheduled
      if (!isManualTrigger) {
        this.settings.lastDispatchedDate = todayStr;
      }

      const logEntry = {
        executedAt: new Date().toISOString(),
        date: todayStr,
        isManualTrigger,
        totalDue: dueStudents.length,
        sentCount: results.filter(r => r.status === 'Delivered').length,
        failedCount: results.filter(r => r.status === 'Failed').length
      };

      this.settings.recentDispatches = [
        logEntry,
        ...(this.settings.recentDispatches || []).slice(0, 19)
      ];
      this.saveSettings();

      return {
        success: true,
        message: `Dispatched ${logEntry.sentCount} of ${logEntry.totalDue} reminder(s) successfully.`,
        summary: logEntry,
        details: results
      };

    } catch (err) {
      console.error('[Expiry Scheduler] Batch dispatch error:', err);
      return { success: false, error: err.message || 'Dispatch error occurred.' };
    } finally {
      this.isDispatching = false;
    }
  }
}

export const expiryScheduler = new ExpirySchedulerService();
export default expiryScheduler;
