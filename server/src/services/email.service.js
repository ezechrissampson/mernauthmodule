import transporter from '../config/mailer.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import * as templates from '../templates/emails/templates.js';

async function send({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Email failures must never crash the request — log and continue.
    logger.error(`Failed to send email to ${to}: ${error.message}`);
  }
}

export const emailService = {
  sendVerificationCode: (to, fullName, code) => {
    const { subject, html } = templates.verificationCodeEmail({ fullName, code });
    return send({ to, subject, html });
  },
  sendVerificationLink: (to, fullName, link) => {
    const { subject, html } = templates.verificationLinkEmail({ fullName, link });
    return send({ to, subject, html });
  },
  sendWelcome: (to, fullName) => {
    const { subject, html } = templates.welcomeEmail({ fullName });
    return send({ to, subject, html });
  },
  sendPasswordReset: (to, fullName, link) => {
    const { subject, html } = templates.passwordResetEmail({ fullName, link });
    return send({ to, subject, html });
  },
  sendPasswordChanged: (to, fullName, ip, userAgent) => {
    const { subject, html } = templates.passwordChangedEmail({
      fullName,
      ip,
      userAgent,
      when: new Date().toUTCString(),
    });
    return send({ to, subject, html });
  },
  sendEmailChangedNotification: (to, fullName, oldEmail, newEmail) => {
    const { subject, html } = templates.emailChangedNotificationEmail({ fullName, oldEmail, newEmail });
    return send({ to, subject, html });
  },
  sendAccountDeletionScheduled: (to, fullName, graceDays, purgeDate) => {
    const { subject, html } = templates.accountDeletionEmail({
      fullName,
      graceDays,
      purgeDate: purgeDate.toUTCString(),
    });
    return send({ to, subject, html });
  },
};
