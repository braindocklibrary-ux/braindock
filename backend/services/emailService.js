import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const buildSmtpConfig = ({ port, secure }) => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port,
  secure,
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.SMTP_USER || 'climatehero2026@gmail.com',
    pass: process.env.SMTP_PASS || 'igsj ohfd bnjc jugy'
  }
});

const postJsonHttps = async (url, headers, payload, timeoutMs = 10000) => {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs)
  });
  const textBody = await resp.text();
  let parsed = null;
  try { parsed = JSON.parse(textBody); } catch (_) {}
  return { ok: resp.ok, status: resp.status, text: textBody, data: parsed };
};

const parseSender = (smtpFrom) => {
  const match = String(smtpFrom || '').match(/^\s*"?([^"<]+?)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: 'Brain Dock Library', email: process.env.SMTP_USER || 'climatehero2026@gmail.com' };
};

/**
 * Send OTP Verification Email to Student
 * Tries HTTPS providers first (Apps Script Webhook, Brevo, Resend) because cloud hosts like Render
 * block outbound SMTP ports 25/465/587, then falls back to SMTP 587 / 465 for local/unblocked servers.
 */
export const sendOtpEmail = async ({ to, studentName, otpCode, phone, seatNumber }) => {
  const smtpFrom = process.env.SMTP_FROM || 'Brain Dock Library <climatehero2026@gmail.com>';
  const sender = parseSender(smtpFrom);
  const subject = `Brain Dock Library - Your Login OTP is ${otpCode}`;
  const textContent = `Your Brain Dock Library verification code is ${otpCode}. Valid for 15 minutes.`;

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #6b21a8; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">BRAIN DOCK LIBRARY</h2>
      <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Digital Study Space & Biometric Access Portal</p>
    </div>

    <div style="background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px; border: 1px solid #d8b4fe;">
      <p style="margin: 0; font-size: 13px; color: #581c87; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Student Portal Login Code</p>
      <div style="font-size: 38px; font-weight: 900; color: #4c1d95; letter-spacing: 8px; margin: 12px 0; font-family: monospace;">
        ${otpCode}
      </div>
      <p style="margin: 0; font-size: 12px; color: #7e22ce;">This verification code is valid for 15 minutes.</p>
    </div>

    <div style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
      <p style="margin: 0 0 8px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
      <p style="margin: 0 0 8px;">A login request was made for your student portal account linked with mobile number <strong>+91 ${phone || ''}</strong> ${seatNumber ? `(Desk #${seatNumber})` : ''}.</p>
      <p style="margin: 0;">Enter this 6-digit code on the Student Portal screen to access your live study hours, attendance punch logs, and fee receipts.</p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0;">If you did not request this OTP, please contact the Library Director Desk immediately.</p>
      <p style="margin: 4px 0 0;">&copy; 2026 Brain Dock Library Management System. All rights reserved.</p>
    </div>
  </div>
  `;

  let lastError = 'Email delivery failed';

  // 1. HTTPS Google Apps Script Email Webhook (free Gmail delivery via HTTPS port 443)
  if (process.env.EMAIL_WEBHOOK_URL) {
    try {
      const res = await postJsonHttps(process.env.EMAIL_WEBHOOK_URL, {}, {
        action: 'sendOtpEmail',
        to,
        subject,
        html: htmlContent,
        text: textContent,
        studentName,
        otpCode,
        phone,
        seatNumber
      });
      if (res.ok && res.data && (res.data.success || res.data.ok || res.data.emailSent)) {
        console.log(`[EMAIL_OTP_WEBHOOK] Dispatched OTP to ${to} via Google Apps Script`);
        return { success: true, provider: 'apps-script-webhook' };
      }
      lastError = `Apps Script webhook HTTP ${res.status}`;
      console.warn(`[EMAIL_OTP_WEBHOOK_WARN] ${lastError}: ${res.text.slice(0, 180)}`);
    } catch (err) {
      lastError = err.message;
      console.warn(`[EMAIL_OTP_WEBHOOK_WARN] Webhook failed: ${err.message}`);
    }
  }

  // 2. HTTPS API via Brevo (300 free transactional emails/day, works with single verified Gmail)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await postJsonHttps(
        'https://api.brevo.com/v3/smtp/email',
        { 'api-key': process.env.BREVO_API_KEY },
        {
          sender: { name: sender.name, email: process.env.BREVO_SENDER_EMAIL || sender.email },
          to: [{ email: to, name: studentName || 'Student' }],
          subject,
          htmlContent,
          textContent
        }
      );
      if (res.ok) {
        console.log(`[EMAIL_OTP_BREVO] Dispatched OTP to ${to} (Id: ${res.data?.messageId || 'ok'})`);
        return { success: true, messageId: res.data?.messageId, provider: 'brevo' };
      }
      lastError = `Brevo HTTP ${res.status}`;
      console.warn(`[EMAIL_OTP_BREVO_WARN] ${lastError}: ${res.text.slice(0, 180)}`);
    } catch (err) {
      lastError = err.message;
      console.warn(`[EMAIL_OTP_BREVO_WARN] Brevo failed: ${err.message}`);
    }
  }

  // 3. HTTPS API via Resend if configured (never blocked by cloud SMTP firewalls)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await postJsonHttps(
        'https://api.resend.com/emails',
        { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        {
          from: process.env.RESEND_FROM || smtpFrom,
          to: [to],
          subject,
          html: htmlContent,
          text: textContent
        }
      );
      if (res.ok) {
        console.log(`[EMAIL_OTP_RESEND] Dispatched OTP to ${to} (Id: ${res.data?.id || 'ok'})`);
        return { success: true, messageId: res.data?.id, provider: 'resend' };
      }
      lastError = `Resend HTTP ${res.status}`;
      console.warn(`[EMAIL_OTP_RESEND_WARN] ${lastError}: ${res.text.slice(0, 180)}`);
    } catch (err) {
      lastError = err.message;
      console.warn(`[EMAIL_OTP_RESEND_WARN] Resend failed: ${err.message}`);
    }
  }

  // 4. Try configured SMTP port (default 587 STARTTLS), then fallback to SSL port 465
  const primaryPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const attempts = [
    { port: primaryPort, secure: primaryPort === 465 },
    primaryPort === 465 ? { port: 587, secure: false } : { port: 465, secure: true }
  ];

  for (const cfg of attempts) {
    try {
      const transporter = nodemailer.createTransport(buildSmtpConfig(cfg));
      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html: htmlContent,
        text: textContent
      });
      console.log(`[EMAIL_OTP] Successfully dispatched OTP ${otpCode} to ${to} via port ${cfg.port} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, port: cfg.port };
    } catch (err) {
      lastError = err.message;
      console.error(`[EMAIL_OTP_ERROR] Port ${cfg.port} failed for ${to}:`, err.message);
    }
  }

  return { success: false, error: lastError };
};
