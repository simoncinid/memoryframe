import nodemailer from 'nodemailer';
import { config } from './config.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  return transporter;
}

/**
 * Sends verification email with code
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const mailOptions = {
    from: `"${config.emailFromName}" <${config.emailFrom}>`,
    to: email,
    subject: 'Verify your MemoryFrame account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .code-box { display: inline-block; padding: 20px 30px; background-color: #f0f0f0; border: 2px solid #007bff; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to MemoryFrame!</h1>
          <p>Thank you for registering. To complete your registration, enter the following verification code:</p>
          <div style="text-align: center;">
            <div class="code-box">${code}</div>
          </div>
          <p>The code will expire in 24 hours.</p>
          <p>If you did not request this registration, you can ignore this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to MemoryFrame!
      
      Thank you for registering. To complete your registration, enter the following verification code:
      
      ${code}
      
      The code will expire in 24 hours.
      
      If you did not request this registration, you can ignore this email.
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}

/**
 * Sends password reset email (optional, for future use)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${config.frontendOrigin}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${config.emailFromName}" <${config.emailFrom}>`,
    to: email,
    subject: 'Reset Password MemoryFrame',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Password</h1>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, you can ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}
