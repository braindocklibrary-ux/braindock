import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'climatehero2026@gmail.com',
    pass: process.env.SMTP_PASS || 'igsj ohfd bnjc jugy'
  }
});

/**
 * Dispatches automated backup to Google Drive Webhook and Email
 */
export const dispatchGoogleDriveBackup = async ({ eventType, admission, fullBackup, webhookUrl }) => {
  const targetWebhook = webhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL;
  const results = { webhook: null, email: null };

  // 1. Send to Google Apps Script Webhook (Google Drive & Google Sheets) if configured
  if (targetWebhook) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        eventType: eventType || 'ADMISSION_UPDATE',
        admission: admission || null,
        totalAdmissions: fullBackup?.admissions?.length || 0,
        fullData: fullBackup || null
      };

      const res = await fetch(targetWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      results.webhook = { success: true, status: res.status };
      console.log(`[GOOGLE_DRIVE_SYNC] Synced ${eventType} event to Google Drive Webhook.`);
    } catch (err) {
      console.error('[GOOGLE_DRIVE_SYNC_ERROR] Webhook dispatch error:', err.message);
      results.webhook = { success: false, error: err.message };
    }
  }

  // 2. Email Backup Snapshot to Gmail (Permanent Google Cloud Storage)
  if (fullBackup && fullBackup.admissions && fullBackup.admissions.length > 0) {
    try {
      const recipient = process.env.BACKUP_EMAIL || 'braindocklibrary@gmail.com';
      const backupJsonString = JSON.stringify(fullBackup, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'Brain Dock Library <climatehero2026@gmail.com>',
        to: recipient,
        subject: `[Brain Dock Cloud Backup] ${eventType || 'Admission Sync'} - ${fullBackup.admissions.length} Students (${dateStr})`,
        text: `Automated Brain Dock Library Google Cloud Backup Snapshot.\nEvent: ${eventType}\nActive Admissions: ${fullBackup.admissions.length}\nDate: ${new Date().toLocaleString()}\n\nAttached is the complete database JSON file. You can restore this file anytime from Owner Portal -> Restore Data.`,
        attachments: [
          {
            filename: `BrainDock_Backup_${dateStr}_${Date.now().toString().slice(-4)}.json`,
            content: backupJsonString,
            contentType: 'application/json'
          }
        ]
      });
      results.email = { success: true, recipient };
      console.log(`[GOOGLE_BACKUP_EMAIL] Automated backup JSON dispatched to ${recipient}`);
    } catch (err) {
      console.error('[GOOGLE_BACKUP_EMAIL_ERROR] Email dispatch error:', err.message);
      results.email = { success: false, error: err.message };
    }
  }

  return results;
};
