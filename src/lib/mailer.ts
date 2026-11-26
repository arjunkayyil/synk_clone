/**
 * src/lib/mailer.ts
 * Nodemailer transporter — configure via .env variables.
 * Uses Gmail (or any SMTP) to send password-reset emails.
 */

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS upgrade via STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"Synk" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your Synk password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f1117;color:#e2e8f0;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-flex;width:40px;height:40px;background:#2563eb;border-radius:10px;align-items:center;justify-content:center;font-size:18px;font-weight:bold;color:#fff;">S</div>
          <h2 style="margin:12px 0 4px;color:#f8fafc;">Password Reset Request</h2>
          <p style="color:#94a3b8;margin:0;font-size:14px;">Hi ${name}, we received a request to reset your password.</p>
        </div>
        <a href="${resetUrl}"
           style="display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;margin:24px 0;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:12px;text-align:center;">
          This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;" />
        <p style="color:#475569;font-size:11px;text-align:center;">Synk — Task Management Platform</p>
      </div>
    `,
  });
}
