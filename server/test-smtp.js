/**
 * SMTP Test Script – run this BEFORE setting credentials on Render.
 * Usage: node server/test-smtp.js
 *
 * Fill in YOUR_GMAIL and YOUR_APP_PASSWORD below, then run the script.
 * If it prints "✅ Email sent!", the credentials are correct.
 */

import nodemailer from 'nodemailer';

// ─── FILL THESE IN ────────────────────────────────────────────────────────────
const SMTP_USER     = 'saifsiddiqui5102@gmail.com';      // ← your Gmail address
const SMTP_PASS     = 'orvgembsdkajmcrq';        // ← 16-char App Password (spaces OK)
const TEST_SEND_TO  = 'saifsiddiqui5102@gmail.com';       // ← send the test email to yourself
// ──────────────────────────────────────────────────────────────────────────────

async function testSMTP() {
  console.log('\n🔍 Testing SMTP connection...\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS.replace(/\s/g, ''),   // strip spaces if any
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    // Step 1: verify credentials
    await transporter.verify();
    console.log('✅ SMTP credentials verified – connection to Gmail is working!\n');

    // Step 2: send a real test email
    const info = await transporter.sendMail({
      from: `"CareerElevate AI Test" <${SMTP_USER}>`,
      to: TEST_SEND_TO,
      subject: '✅ CareerElevate – SMTP Test Email',
      text: 'If you received this, your Gmail App Password is correct and ready for Render!',
      html: '<h2>✅ SMTP is working!</h2><p>Your Gmail App Password is correct and ready to be set on Render.</p>',
    });

    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('\n📬 Check your inbox at:', TEST_SEND_TO);
    console.log('\n🚀 Your credentials are correct. Now set them on Render.\n');

  } catch (err) {
    console.error('❌ SMTP test FAILED:\n');
    console.error('   Error:', err.message);
    console.error('\n── Common causes ──────────────────────────────────────────');

    if (err.message.includes('535') || err.message.includes('Username and Password')) {
      console.error('   ➤ Wrong App Password. Re-generate it at:');
      console.error('     https://myaccount.google.com/apppasswords');
      console.error('   ➤ Make sure 2-Step Verification is ON on that Gmail account.');
    } else if (err.message.includes('534') || err.message.includes('less secure')) {
      console.error('   ➤ Gmail is blocking sign-in. You need an App Password, not your');
      console.error('     regular Gmail password.');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      console.error('   ➤ Network/firewall is blocking port 587. Try a different network.');
    } else {
      console.error('   ➤ Unexpected error – see full details above.');
    }
    console.error('────────────────────────────────────────────────────────────\n');
    process.exit(1);
  }
}

testSMTP();
