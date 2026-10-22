import nodemailer from 'nodemailer';

const isProduction = process.env.NODE_ENV === 'production';

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass && user !== 'noreply.careerelevate@gmail.com') {
    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure,
      auth: { user, pass }
    });
  }

  if (isProduction) {
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

export async function sendOTPEmail(email, otp, name = 'Candidate', purpose = 'login') {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('SMTP credentials are not configured in production environment.');
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
