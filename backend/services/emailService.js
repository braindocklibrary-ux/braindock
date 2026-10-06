import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'climatehero2026@gmail.com',
    pass: process.env.SMTP_PASS || 'igsj ohfd bnjc jugy'
  }
});

/**
 * Send OTP Verification Email to Student
 */
export const sendOtpEmail = async ({ to, studentName, otpCode, phone, seatNumber }) => {
  const smtpFrom = process.env.SMTP_FROM || 'Brain Dock Library <climatehero2026@gmail.com>';
  
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
      <p style="margin: 0 0 8px;">A login request was made for your student portal account linked with mobile number <strong>+91 ${phone}</strong> ${seatNumber ? `(Desk #${seatNumber})` : ''}.</p>
      <p style="margin: 0;">Enter this 6-digit code on the Student Portal screen to access your live study hours, attendance punch logs, and fees summary.</p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0;">If you did not request this OTP, please contact the Library Director Desk immediately.</p>
      <p style="margin: 4px 0 0;">&copy; 2026 Brain Dock Library Management System. All rights reserved.</p>
    </div>
  </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Brain Dock Library - Your Login OTP is ${otpCode}`,
      html: htmlContent,
      text: `Your Brain Dock Library verification code is ${otpCode}. Valid for 15 minutes.`
    });
    console.log(`[EMAIL_OTP] Successfully dispatched OTP ${otpCode} to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL_OTP_ERROR] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};
