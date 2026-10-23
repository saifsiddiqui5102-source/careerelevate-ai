import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

export const isSmtpConfigured = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return false;
  if (pass === 'your_app_specific_password') return false;
  return true;
};

export const getTransporter = () => {
  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, we MUST NOT silently simulate email delivery
    return null;
  }

  // Development / Test Simulation Transporter
  return {
    async sendMail(options) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('====================================================');
        console.log('📧 [NODEMAILER EMAIL DISPATCH SIMULATOR]');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('====================================================');
      }
      return { messageId: `simulated-${Date.now()}` };
    }
  };
};

/**
 * Categorizes an email delivery error into distinct operational buckets.
 * Distinguishes missing config, auth failure, connection timeout, and general delivery failure.
 */
export function classifyEmailError(err) {
  const code = String(err?.code || '').toUpperCase();
  const message = String(err?.message || '');
  const response = String(err?.response || '');

  // 1. Missing or placeholder configuration
  if (
    code === 'ECONFIG_MISSING' ||
    message.includes('credentials are not configured') ||
    message.includes('SMTP_USER') ||
    message.includes('SMTP_PASS')
  ) {
    return {
      category: 'MISSING_SMTP_CONFIG',
      description: 'SMTP configuration is missing or incomplete (SMTP_USER or SMTP_PASS not configured).'
    };
  }

  // 2. Authentication failures (invalid credentials or App Password required)
  if (
    code === 'EAUTH' ||
    message.includes('535') ||
    response.includes('535') ||
    message.toLowerCase().includes('username and password not accepted') ||
    message.toLowerCase().includes('invalid login')
  ) {
    return {
      category: 'SMTP_AUTH_FAILURE',
      description: 'SMTP authentication failed. Verify SMTP_USER and ensure SMTP_PASS is a valid 16-character Google App Password (not standard account password) with 2FA enabled.'
    };
  }

  // 3. Connection / Network timeouts or host lookup failures
  if (
    ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ESOCKET', 'EDNS'].includes(code) ||
    message.toLowerCase().includes('timeout') ||
    message.toLowerCase().includes('connection refused') ||
    message.toLowerCase().includes('greeting never received')
  ) {
    return {
      category: 'SMTP_CONNECTION_TIMEOUT',
      description: 'SMTP connection failed or timed out. Check SMTP_HOST, SMTP_PORT, and outbound network/firewall connectivity.'
    };
  }

  // 4. Other delivery errors (e.g. envelope rejection, rate limits)
  return {
    category: 'SMTP_DELIVERY_FAILURE',
    description: 'Email delivery failed during dispatch.'
  };
}

/**
 * Clearly labelled email-delivery error logger.
 * Logs real SMTP error name, code, message, and safe diagnostic status.
 * NEVER logs passwords, App Passwords, tokens, OTPs, or full env secrets.
 */
export function logEmailDeliveryError(context, err) {
  const { category, description } = classifyEmailError(err);
  const errorName = err?.name || 'Error';
  const errorCode = err?.code || 'N/A';
  const errorMessage = err?.message || 'Unknown email delivery error';

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const userConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_USER.trim());
  const passConfigured = Boolean(
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS.trim() &&
    process.env.SMTP_PASS !== 'your_app_specific_password'
  );

  const logDetails = `[EMAIL-DELIVERY-ERROR] Context: [${context}] | Category: [${category}] | ErrorName: [${errorName}] | ErrorCode: [${errorCode}] | Message: "${errorMessage}" | Host: ${host}:${port} | SmtpUserConfigured: ${userConfigured} | SmtpPassConfigured: ${passConfigured} | Resolution: ${description}`;

  // Log to stderr so cloud logs (Render, etc.) capture it immediately
  console.error(logDetails);

  try {
    logger.error(logDetails, {
      context,
      category,
      errorName,
      errorCode,
      errorMessage,
      diagnostics: { host, port, userConfigured, passConfigured }
    });
  } catch {
    // Prevent logging failures from affecting control flow
  }
}

export async function sendOTPEmail(email, otp, name = 'Candidate', purpose = 'login') {
  const transporter = getTransporter();
  if (!transporter) {
    const configErr = new Error('SMTP credentials are not configured in production environment (SMTP_USER or SMTP_PASS missing or placeholder).');
    configErr.code = 'ECONFIG_MISSING';
    throw configErr;
  }

  const isLogin = purpose === 'login';
  const actionText = isLogin ? 'log in to' : 'activate';
  const title = isLogin ? 'Sign-In Two-Factor Verification' : 'Account Activation Verification';

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"CareerElevate AI" <noreply@careerelevate.ai>',
    to: email,
    subject: `Your CareerElevate AI Verification Code`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07090e; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #818cf8; font-size: 24px; margin: 0; font-weight: 800;">CareerElevate AI</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${title}</p>
        </div>
        
        <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello, ${name}!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Please use the 6-digit verification code below to ${actionText} your CareerElevate AI account:
          </p>
          
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px; padding: 16px 24px; display: inline-block; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ffffff;">${otp}</span>
          </div>
          
          <p style="color: #f59e0b; font-size: 12px; font-weight: 600; margin-top: 8px;">
            ⏰ Code expires in 5 minutes. Allow up to 5 verification attempts per code.
          </p>
        </div>

        <div style="margin-top: 32px; text-align: center; color: #64748b; font-size: 12px;">
          <p>If you did not request this verification code, please ignore this email or update your password.</p>
          <p>© 2026 CareerElevate AI. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email, resetUrl, name = 'Candidate') {
  const transporter = getTransporter();
  if (!transporter) {
    const configErr = new Error('SMTP credentials are not configured in production environment (SMTP_USER or SMTP_PASS missing or placeholder).');
    configErr.code = 'ECONFIG_MISSING';
    throw configErr;
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"CareerElevate AI" <noreply@careerelevate.ai>',
    to: email,
    subject: `Password Reset Request - CareerElevate AI`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07090e; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #818cf8; font-size: 24px; margin: 0; font-weight: 800;">CareerElevate AI</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
        </div>
        
        <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for your CareerElevate AI candidate account.
          </p>

          <div style="margin: 24px 0;">
            <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
              Reset Password Now
            </a>
          </div>

          <p style="color: #f59e0b; font-size: 12px; font-weight: 600; margin-top: 8px;">
            ⏰ Link expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>

        <div style="margin-top: 32px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2026 CareerElevate AI. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email, name = 'Candidate') {
  const transporter = getTransporter();
  if (!transporter) {
    return null;
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"CareerElevate AI" <noreply@careerelevate.ai>',
    to: email,
    subject: `Welcome to CareerElevate AI, ${name}! 🎉`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07090e; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #818cf8; font-size: 24px; margin: 0; font-weight: 800;">CareerElevate AI</h1>
          <p style="color: #34d399; font-size: 14px; font-weight: 700; margin-top: 4px;">✓ Account Activated Successfully</p>
        </div>
        
        <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Congratulations ${name}!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Your email has been verified. You now have full access to:
          </p>
          <ul style="color: #818cf8; font-size: 14px; line-height: 1.8;">
            <li><strong>ATS Resume Analyzer</strong> - Real-time keyword & metric audits</li>
            <li><strong>AI Mock Interview Simulator</strong> - Voice & text interactive scoring</li>
            <li><strong>System Design & Tech Question Bank</strong> - STAR model benchmark answers</li>
            <li><strong>Candidate Readiness Dashboard</strong> - Live competency radar charts</li>
          </ul>
        </div>

        <div style="margin-top: 32px; text-align: center; color: #64748b; font-size: 12px;">
          <p>© 2026 CareerElevate AI. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}
