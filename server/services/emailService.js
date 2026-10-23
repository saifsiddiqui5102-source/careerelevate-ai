import { Resend } from 'resend';
import logger from '../config/logger.js';

export const isEmailConfigured = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  if (apiKey === 'your_resend_api_key_here') return false;
  return true;
};

// Backwards compatibility alias
export const isSmtpConfigured = isEmailConfigured;

export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (isEmailConfigured()) {
    return new Resend(apiKey);
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, we MUST NOT silently simulate email delivery
    return null;
  }

  // Development / Test Simulation Client
  return {
    emails: {
      async send(payload) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('====================================================');
          console.log('📧 [RESEND EMAIL DISPATCH SIMULATOR]');
          console.log(`To: ${payload.to}`);
          console.log(`Subject: ${payload.subject}`);
          console.log('====================================================');
        }
        return { data: { id: `simulated-resend-${Date.now()}` }, error: null };
      }
    }
  };
};

// Backwards compatibility alias
export const getTransporter = getResendClient;

/**
 * Categorizes an email delivery error into distinct operational buckets for Resend.
 */
export function classifyEmailError(err) {
  const code = String(err?.code || '').toUpperCase();
  const message = String(err?.message || '');
  const name = String(err?.name || '');

  // 1. Missing API Key
  if (
    code === 'ERESEND_KEY_MISSING' ||
    code === 'ECONFIG_MISSING' ||
    message.includes('RESEND_API_KEY') ||
    message.includes('credentials are not configured')
  ) {
    return {
      category: 'MISSING_RESEND_CONFIG',
      description: 'RESEND_API_KEY is not configured in server environment settings.'
    };
  }

  // 2. Authentication failure (invalid API key)
  if (
    code.includes('401') ||
    name.toLowerCase().includes('invalid_api_key') ||
    message.toLowerCase().includes('api key') ||
    message.toLowerCase().includes('unauthorized')
  ) {
    return {
      category: 'RESEND_AUTH_FAILURE',
      description: 'Resend API key is invalid or unauthorized. Check RESEND_API_KEY in server environment settings.'
    };
  }

  // 3. Sender domain / Validation restriction (e.g. testing domain restrictions or unverified domain)
  if (
    code.includes('403') ||
    code.includes('422') ||
    name.toLowerCase().includes('validation_error') ||
    message.toLowerCase().includes('only send testing emails') ||
    message.toLowerCase().includes('verify a domain') ||
    message.toLowerCase().includes('domain')
  ) {
    return {
      category: 'RESEND_DOMAIN_RESTRICTION',
      description: 'Sender domain unverified. With onboarding@resend.dev, emails can only be delivered to your registered Resend account email. Verify a custom domain in Resend to send to any user.'
    };
  }

  // 4. Rate Limiting
  if (
    code.includes('429') ||
    name.toLowerCase().includes('rate_limit') ||
    message.toLowerCase().includes('rate limit')
  ) {
    return {
      category: 'RESEND_RATE_LIMITED',
      description: 'Resend API rate limit exceeded. Please wait before retrying.'
    };
  }

  // 5. Connection / Network timeout
  if (
    ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ESOCKET'].includes(code) ||
    message.toLowerCase().includes('timeout')
  ) {
    return {
      category: 'RESEND_NETWORK_TIMEOUT',
      description: 'Network timeout contacting Resend HTTP API endpoint (https://api.resend.com).'
    };
  }

  // 6. Generic delivery error
  return {
    category: 'RESEND_DELIVERY_FAILURE',
    description: 'Email delivery failed during Resend API dispatch.'
  };
}

/**
 * Clearly labelled email-delivery error logger.
 * Logs real Resend error name, code, message, and safe diagnostic status.
 * NEVER logs API keys, passwords, tokens, OTPs, or full env secrets.
 */
export function logEmailDeliveryError(context, err) {
  const { category, description } = classifyEmailError(err);
  const errorName = err?.name || 'Error';
  const errorCode = err?.code || 'N/A';
  const errorMessage = err?.message || 'Unknown email delivery error';

  const fromEmail = process.env.FROM_EMAIL?.trim() || 'CareerElevate AI <onboarding@resend.dev>';
  const hasApiKey = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY.trim() &&
    process.env.RESEND_API_KEY !== 'your_resend_api_key_here'
  );

  const logDetails = `[EMAIL-DELIVERY-ERROR] Context: [${context}] | Provider: [Resend API] | Category: [${category}] | ErrorName: [${errorName}] | ErrorCode: [${errorCode}] | Message: "${errorMessage}" | From: ${fromEmail} | ResendKeyConfigured: ${hasApiKey} | Resolution: ${description}`;

  // Log to stderr so cloud logs (Render, etc.) capture it immediately
  console.error(logDetails);

  try {
    logger.error(logDetails, {
      context,
      provider: 'Resend',
      category,
      errorName,
      errorCode,
      errorMessage,
      diagnostics: { fromEmail, resendKeyConfigured: hasApiKey }
    });
  } catch {
    // Prevent logging failures from affecting control flow
  }
}

/**
 * Dispatches an email using the Resend HTTP API.
 * Ensures that success is NEVER reported if Resend returns an error.
 */
export async function sendEmailViaResend({ to, subject, html }) {
  const client = getResendClient();
  if (!client) {
    const configErr = new Error('Resend API key is not configured in production environment (RESEND_API_KEY missing).');
    configErr.code = 'ERESEND_KEY_MISSING';
    throw configErr;
  }

  const fromEmail = process.env.FROM_EMAIL?.trim() || 'CareerElevate AI <onboarding@resend.dev>';
  const recipientList = Array.isArray(to) ? to : [to];

  const response = await client.emails.send({
    from: fromEmail,
    to: recipientList,
    subject,
    html
  });

  if (response?.error) {
    const errorObj = response.error;
    const sendErr = new Error(errorObj.message || 'Resend rejected email dispatch.');
    sendErr.name = errorObj.name || 'ResendError';
    sendErr.code = errorObj.statusCode ? `RESEND_${errorObj.statusCode}` : (errorObj.name || 'ERESEND_ERROR');
    sendErr.statusCode = errorObj.statusCode;
    throw sendErr;
  }

  if (!response?.data?.id) {
    const noIdErr = new Error('Resend did not return a valid message ID.');
    noIdErr.code = 'ERESEND_NO_ID';
    throw noIdErr;
  }

  return response.data;
}

export async function sendOTPEmail(email, otp, name = 'Candidate', purpose = 'login') {
  const isLogin = purpose === 'login';
  const actionText = isLogin ? 'log in to' : 'activate';
  const title = isLogin ? 'Sign-In Two-Factor Verification' : 'Account Activation Verification';

  const html = `
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
  `;

  return await sendEmailViaResend({
    to: email,
    subject: `Your CareerElevate AI Verification Code`,
    html
  });
}

export async function sendPasswordResetEmail(email, resetUrl, name = 'Candidate') {
  const html = `
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
  `;

  return await sendEmailViaResend({
    to: email,
    subject: `Password Reset Request - CareerElevate AI`,
    html
  });
}

export async function sendWelcomeEmail(email, name = 'Candidate') {
  const client = getResendClient();
  if (!client) {
    return null;
  }

  const html = `
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
  `;

  try {
    return await sendEmailViaResend({
      to: email,
      subject: `Welcome to CareerElevate AI, ${name}! 🎉`,
      html
    });
  } catch (err) {
    // Welcome email failure is non-blocking
    logEmailDeliveryError('welcome-email', err);
    return null;
  }
}
