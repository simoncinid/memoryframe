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
 * Invia email di verifica con codice
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const mailOptions = {
    from: `"${config.emailFromName}" <${config.emailFrom}>`,
    to: email,
    subject: 'Verifica il tuo account MemoryFrame',
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
          <h1>Benvenuto su MemoryFrame!</h1>
          <p>Grazie per esserti registrato. Per completare la registrazione, inserisci il seguente codice di verifica:</p>
          <div style="text-align: center;">
            <div class="code-box">${code}</div>
          </div>
          <p>Il codice scadrà tra 24 ore.</p>
          <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Benvenuto su MemoryFrame!
      
      Grazie per esserti registrato. Per completare la registrazione, inserisci il seguente codice di verifica:
      
      ${code}
      
      Il codice scadrà tra 24 ore.
      
      Se non hai richiesto questa registrazione, puoi ignorare questa email.
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}

/**
 * Invia email di reset password (opzionale, per futuro)
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
          <p>Hai richiesto il reset della password. Clicca sul pulsante qui sotto per reimpostare la tua password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Oppure copia e incolla questo link nel tuo browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Questo link scadrà tra 1 ora.</p>
          <p>Se non hai richiesto il reset della password, puoi ignorare questa email.</p>
        </div>
      </body>
      </html>
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}
