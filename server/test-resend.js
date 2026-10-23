/**
 * Resend Email API Test Script
 * Usage: node server/test-resend.js
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'CareerElevate AI <onboarding@resend.dev>';
const TO_EMAIL = process.argv[2] || process.env.TEST_EMAIL;

async function testResend() {
  console.log('\n🔍 Testing Resend HTTP API Delivery...\n');

  if (!RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY is not set in environment or server/.env');
    console.error('   Please add RESEND_API_KEY=re_... to server/.env or pass it via environment.');
    process.exit(1);
  }

  if (!TO_EMAIL) {
    console.error('❌ Error: Recipient email is required.');
    console.error('   Usage: node server/test-resend.js your-email@example.com');
    console.error('\n   NOTE for onboarding@resend.dev:');
    console.error('   If using onboarding@resend.dev, the recipient MUST be the email address');
    console.error('   associated with your Resend account, unless you have verified a domain.');
    process.exit(1);
  }

  console.log(`From:    ${FROM_EMAIL}`);
  console.log(`To:      ${TO_EMAIL}`);
  console.log(`Key:     ${RESEND_API_KEY.slice(0, 6)}...${RESEND_API_KEY.slice(-4)}\n`);

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: '✅ CareerElevate AI – Resend API Test Email',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1;">CareerElevate AI</h2>
          <p>This is a test email sent via the <strong>Resend HTTP API</strong> (Port 443 HTTPS).</p>
          <p style="color: #10b981; font-weight: bold;">✓ Outbound SMTP ports are bypassed completely.</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend API Error:');
      console.error(`   Name:    ${error.name}`);
      console.error(`   Message: ${error.message}`);
      if (error.statusCode) console.error(`   Status:  ${error.statusCode}`);
      process.exit(1);
    }

    console.log('✅ Email successfully accepted by Resend!');
    console.log(`   Message ID: ${data?.id}`);
    console.log(`\n📬 Check inbox at: ${TO_EMAIL}\n`);
  } catch (err) {
    console.error('❌ Network / Unexpected Error:', err.message);
    process.exit(1);
  }
}

testResend();
