import { emailLayout, buttonHtml, codeBlockHtml } from './layout.js';
import { env } from '../../config/env.js';

const appName = env.appName;

export function verificationCodeEmail({ fullName, code }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Verify your email</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">Use the code below to verify your email address. This code expires in ${env.emailVerification.expiresMin} minutes.</p>
    ${codeBlockHtml(code)}
    <p style="color:#6B7280;font-size:13px;">Didn't request this? You can safely ignore this email.</p>
  `;
  return {
    subject: `Your ${appName} verification code`,
    html: emailLayout({ appName, title: 'Verify your email', bodyHtml }),
  };
}

export function verificationLinkEmail({ fullName, link }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Verify your email</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">Please confirm your email address by clicking the button below. This link expires in ${env.emailVerification.expiresMin} minutes.</p>
    ${buttonHtml(link, 'Verify Email')}
    <p style="color:#6B7280;font-size:13px;margin-top:20px;">Or copy this link: <br/><span style="word-break:break-all;">${link}</span></p>
  `;
  return {
    subject: `Verify your email for ${appName}`,
    html: emailLayout({ appName, title: 'Verify your email', bodyHtml }),
  };
}

export function welcomeEmail({ fullName }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Welcome, ${fullName} 🎉</h2>
    <p style="color:#374151;font-size:14px;line-height:22px;">Your email has been verified and your account is now fully active. We're glad to have you on board.</p>
  `;
  return {
    subject: `Welcome to ${appName}`,
    html: emailLayout({ appName, title: 'Welcome', bodyHtml }),
  };
}

export function passwordResetEmail({ fullName, link }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Reset your password</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">We received a request to reset your password. This link is valid for ${env.passwordReset.expiresMin} minutes and can only be used once.</p>
    ${buttonHtml(link, 'Reset Password')}
    <p style="color:#6B7280;font-size:13px;margin-top:20px;">If you didn't request a password reset, please secure your account immediately.</p>
  `;
  return {
    subject: `Reset your ${appName} password`,
    html: emailLayout({ appName, title: 'Reset your password', bodyHtml }),
  };
}

export function passwordChangedEmail({ fullName, ip, userAgent, when }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Your password was changed</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">Your password was successfully changed on ${when}.</p>
    <table style="width:100%;font-size:13px;color:#6B7280;margin-top:12px;">
      <tr><td style="padding:4px 0;">IP Address</td><td style="text-align:right;">${ip}</td></tr>
      <tr><td style="padding:4px 0;">Device</td><td style="text-align:right;">${userAgent}</td></tr>
    </table>
    <p style="color:#DC2626;font-size:13px;margin-top:16px;">If this wasn't you, reset your password immediately and contact support.</p>
  `;
  return {
    subject: `Your ${appName} password was changed`,
    html: emailLayout({ appName, title: 'Password changed', bodyHtml }),
  };
}

export function emailChangedNotificationEmail({ fullName, oldEmail, newEmail }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Your email address was changed</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">The email on your account was changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
    <p style="color:#DC2626;font-size:13px;margin-top:16px;">If you didn't make this change, contact support immediately.</p>
  `;
  return {
    subject: `Your ${appName} email address changed`,
    html: emailLayout({ appName, title: 'Email changed', bodyHtml }),
  };
}

export function accountDeletionEmail({ fullName, graceDays, purgeDate }) {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;">Account deletion scheduled</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${fullName},</p>
    <p style="color:#374151;font-size:14px;line-height:22px;">Your account has been deactivated and is scheduled for permanent deletion on <strong>${purgeDate}</strong> (${graceDays} days from now). Log back in before that date to cancel the deletion.</p>
  `;
  return {
    subject: `Your ${appName} account deletion is scheduled`,
    html: emailLayout({ appName, title: 'Account deletion scheduled', bodyHtml }),
  };
}
