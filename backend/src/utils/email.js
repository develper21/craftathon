const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || "Medication Adherence <no-reply@medadherence.com>",
            to,
            subject,
            html,
        });
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Failed to send email to ${to}: ${err.message}`);
        throw err;
    }
};

// ─── Email Templates ─────────────────────────────────────────────────────────

const emailTemplates = {
    verification: (name, link) => ({
        subject: "Verify Your Email – MedAdherence",
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#4F46E5">Welcome, ${name}! 👋</h2>
        <p>Thanks for signing up. Please verify your email address to get started.</p>
        <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#6B7280;font-size:14px;">This link expires in 24 hours.</p>
      </div>
    `,
    }),

    resetPassword: (name, link) => ({
        subject: "Reset Your Password – MedAdherence",
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#4F46E5">Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#DC2626;color:#fff;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p style="margin-top:16px;color:#6B7280;font-size:14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
    }),

    missedDoseAlert: (caregiverName, patientName, medicationName, time) => ({
        subject: `⚠️ Missed Dose Alert – ${patientName}`,
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#DC2626">Missed Dose Alert</h2>
        <p>Hi ${caregiverName},</p>
        <p><strong>${patientName}</strong> missed their <strong>${medicationName}</strong> dose scheduled at <strong>${time}</strong>.</p>
        <p>Please check in with your patient.</p>
      </div>
    `,
    }),

    weeklyReport: (name, score, taken, missed, scheduled, startDate, endDate) => ({
        subject: `📊 Weekly Adherence Report – ${startDate} to ${endDate}`,
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#4F46E5">Your Weekly Adherence Report</h2>
        <p>Hi ${name}, here's your summary for <strong>${startDate}</strong> – <strong>${endDate}</strong>:</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr style="background:#F3F4F6;">
            <td style="padding:12px;border:1px solid #E5E7EB;">Adherence Score</td>
            <td style="padding:12px;border:1px solid #E5E7EB;color:#4F46E5;font-weight:bold;">${score.toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding:12px;border:1px solid #E5E7EB;">Doses Scheduled</td>
            <td style="padding:12px;border:1px solid #E5E7EB;">${scheduled}</td>
          </tr>
          <tr style="background:#F3F4F6;">
            <td style="padding:12px;border:1px solid #E5E7EB;">Doses Taken</td>
            <td style="padding:12px;border:1px solid #E5E7EB;color:#059669;">${taken}</td>
          </tr>
          <tr>
            <td style="padding:12px;border:1px solid #E5E7EB;">Doses Missed</td>
            <td style="padding:12px;border:1px solid #E5E7EB;color:#DC2626;">${missed}</td>
          </tr>
        </table>
        <p style="margin-top:16px;color:#6B7280;font-size:14px;">Keep it up! Consistency is key to better health.</p>
      </div>
    `,
    }),

    medicationReminder: (name, medicationName, scheduledTime) => ({
        subject: `💊 Medication Reminder – Time to take ${medicationName}`,
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#4F46E5">💊 Medication Reminder</h2>
        <p>Hi ${name},</p>
        <p>It's time to take your <strong>${medicationName}</strong> dose!</p>
        <p style="background:#EFF6FF;border-left:4px solid #4F46E5;padding:12px;border-radius:6px;margin-top:16px;">
          <strong>Scheduled Time:</strong> ${scheduledTime}
        </p>
        <p style="margin-top:16px;color:#6B7280;font-size:14px;">Please take your medication as prescribed. Your adherence matters!</p>
      </div>
    `,
    }),

    patientMissedDose: (name, medicationName, scheduledTime) => ({
        subject: `⚠️ You Missed Your Medication – ${medicationName}`,
        html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#DC2626">⚠️ Missed Dose Alert</h2>
        <p>Hi ${name},</p>
        <p>We noticed you missed your <strong>${medicationName}</strong> dose that was scheduled at <strong>${scheduledTime}</strong>.</p>
        <p style="background:#FEF2F2;border-left:4px solid #DC2626;padding:12px;border-radius:6px;margin-top:16px;">
          <strong>Why this matters:</strong> Taking your medications on time is important for your health. Try to stick to your schedule.
        </p>
        <p style="margin-top:16px;color:#6B7280;font-size:14px;">If you took it later, you can log it in the app. Make sure to take your next dose on time!</p>
      </div>
    `,
    }),
};

module.exports = { sendEmail, emailTemplates };
