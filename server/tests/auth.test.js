process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../server.js';
import { __getLatestOtpForTesting, __getLatestResetTokenForTesting, __setDbOfflineForTesting, memoryUsers } from '../controllers/authController.js';

// ─── AUTH CONTROLLER TEST SUITE ────────────────────────────────────────────────
// All tests run in-memory (MongoDB offline). Auth controller falls back to
// memoryUsers in NODE_ENV === 'test'. OTPs are retrieved via the
// test-only __getLatestOtpForTesting(email) helper — never from HTTP responses.
// ───────────────────────────────────────────────────────────────────────────────

test('Authentication API – Full Two-Step Login Flow & Security Tests', async (t) => {
  let server;
  let port;

  // ── Server Setup ──────────────────────────────────────────────────────────────
  await t.test('START: spin up test HTTP server', async () => {
    server = app.listen(0);
    port = server.address().port;
    assert.ok(port > 0, 'Server must bind to a valid port');
  });

  const ts = Date.now();
  const testUser = {
    name: 'Auth Test Candidate',
    email: `auth_test_${ts}@careerelevate.test`,
    password: 'SecurePass@2026!',
    targetRole: 'Senior Software Engineer'
  };

  let challengeId = '';
  let authToken = '';

  // ── CORS & SECURITY HEADERS ──────────────────────────────────────────────────
  await t.test('CORS: allows Netlify origin preflight with Access-Control-Allow-Origin', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://careerelevate.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://careerelevate.netlify.app');
  });

  await t.test('CORS: allows Vite localhost:5173 origin preflight', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  });

  await t.test('CORS: allows localhost:3000 origin preflight', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  // ── REGISTRATION ─────────────────────────────────────────────────────────────
  await t.test('REGISTER: rejects missing email', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Email', password: 'password123' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('REGISTER: rejects password shorter than 6 chars', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short Pass', email: `short_${ts}@test.com`, password: '123' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('REGISTER: succeeds and issues OTP challenge (no OTP in HTTP body)', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${data.message}`);
    assert.equal(data.success, true);
    assert.equal(data.step, 'verify-otp');
    assert.ok(data.challengeId, 'challengeId must be returned');
    // ⛔ OTP must NOT appear in HTTP response body
    assert.equal(data.otp, undefined, 'otp MUST NOT be in HTTP response');
    assert.equal(data.otpDebug, undefined, 'otpDebug MUST NOT be in HTTP response');
    challengeId = data.challengeId;
  });

  await t.test('REGISTER: duplicate email returns 400 after verification', async () => {
    // We verify now so the account becomes "verified", then re-register should fail
    const otp = __getLatestOtpForTesting(testUser.email);
    assert.ok(otp, 'Test OTP helper must return OTP for test environment');
    // Verify account
    await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp, challengeId })
    });
    // Now try to re-register same email
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  // ── LOGIN – STEP 1: Password Validation ──────────────────────────────────────
  await t.test('LOGIN: rejects completely missing body fields', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('LOGIN: rejects unknown email – no OTP must be sent', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost@unknown.test', password: 'anything' })
    });
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    // Confirm no OTP was queued for this email
    const leaked = __getLatestOtpForTesting('ghost@unknown.test');
    assert.equal(leaked, null, 'OTP must NOT be generated for unknown users');
  });

  await t.test('LOGIN: rejects wrong password – no OTP must be sent', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword!' })
    });
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    // Must not contain any token or OTP hint
    assert.equal(data.token, undefined, 'token MUST NOT be returned on failed login');
    assert.equal(data.otp, undefined, 'otp MUST NOT appear in failed login response');
    assert.equal(data.otpDebug, undefined, 'otpDebug MUST NOT appear in failed login response');
  });

  await t.test('LOGIN: correct credentials – issues OTP challenge (no JWT yet)', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const data = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${data.message}`);
    assert.equal(data.success, true);
    assert.equal(data.step, 'verify-otp');
    assert.equal(data.requiresOtp, true);
    assert.ok(data.challengeId, 'challengeId must be present');
    // ⛔ JWT must NOT be issued before OTP verification
    assert.equal(data.token, undefined, 'JWT MUST NOT be returned before OTP verification');
    assert.equal(data.otp, undefined, 'otp MUST NOT be in HTTP response');
    assert.equal(data.otpDebug, undefined, 'otpDebug MUST NOT be in HTTP response');
    challengeId = data.challengeId;
  });

  // ── VERIFY OTP – Step 2 ───────────────────────────────────────────────────────
  await t.test('VERIFY-OTP: rejects invalid/wrong OTP code', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: '000000', challengeId })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.token, undefined, 'JWT must NOT be issued for wrong OTP');
  });

  await t.test('VERIFY-OTP: rejects mismatched challengeId', async () => {
    const otp = __getLatestOtpForTesting(testUser.email);
    const res = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp, challengeId: 'invalid-challenge-id-tampered' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.token, undefined);
  });

  await t.test('VERIFY-OTP: accepts correct OTP + challengeId and issues real JWT', async () => {
    // Re-login to get a fresh OTP challenge (previous otp attempt consumed 1 attempt)
    await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    }).then(r => r.json()).then(d => { challengeId = d.challengeId || challengeId; });

    const otp = __getLatestOtpForTesting(testUser.email);
    assert.ok(otp, 'OTP must be retrievable via test helper');

    const res = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp, challengeId })
    });
    const data = await res.json();
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${data.message}`);
    assert.equal(data.success, true);
    assert.ok(data.token, 'Real JWT must be returned after successful OTP verification');
    assert.ok(data.user, 'User object must be returned');
    assert.equal(data.otp, undefined, 'otp MUST NOT appear in success response');
    assert.equal(data.otpDebug, undefined, 'otpDebug MUST NOT appear in success response');
    authToken = data.token;
  });

  await t.test('VERIFY-OTP: rejects OTP reuse (single-use enforcement)', async () => {
    // OTP was already consumed above; get the old OTP from test store (it won't change)
    const otp = __getLatestOtpForTesting(testUser.email);
    const res = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp, challengeId })
    });
    const data = await res.json();
    // Should fail: no active OTP challenge after successful verification
    assert.equal(data.success, false);
    assert.equal(data.token, undefined);
  });

  // ── MAX ATTEMPTS ENFORCEMENT ─────────────────────────────────────────────────
  await t.test('VERIFY-OTP: locks out after 5 failed attempts (429)', async () => {
    // Issue a fresh login challenge
    const loginRes = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    const freshChallenge = loginData.challengeId;

    let lastStatus = 0;
    let lastData = {};
    // Submit wrong OTP 5 times (attempt 6 triggers lockout on attempt 6 > 5)
    for (let i = 1; i <= 6; i++) {
      const r = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, otp: `99999${i}`, challengeId: freshChallenge })
      });
      lastStatus = r.status;
      lastData = await r.json();
    }
    assert.equal(lastStatus, 429, 'Must return 429 after exceeding 5 OTP attempts');
    assert.equal(lastData.success, false);
    assert.equal(lastData.token, undefined);
  });

  // ── RESEND OTP ───────────────────────────────────────────────────────────────
  await t.test('RESEND-OTP: enforces 60-second cooldown immediately after OTP send', async () => {
    // Attempting to resend immediately triggers 429
    const res = await fetch(`http://localhost:${port}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const data = await res.json();
    assert.equal(res.status, 429);
    assert.equal(data.success, false);
    assert.ok(data.retryAfterSeconds);
  });

  await t.test('RESEND-OTP: issues new challenge and invalidates previous after cooldown', async () => {
    // Login to get a fresh baseline
    const loginRes = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    const firstChallenge = loginData.challengeId;
    const firstOtp = __getLatestOtpForTesting(testUser.email);

    // Simulate cooldown elapsed in memory or DB
    const memUser = memoryUsers.get(testUser.email.toLowerCase().trim());
    if (memUser) {
      memUser.lastOtpSentAt = new Date(Date.now() - 75 * 1000);
    }
    try {
      const { User } = await import('../models/User.js');
      await User.updateOne({ email: testUser.email.toLowerCase().trim() }, { $set: { lastOtpSentAt: new Date(Date.now() - 75 * 1000) } });
    } catch {}

    const resendRes = await fetch(`http://localhost:${port}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const resendData = await resendRes.json();

    assert.equal(resendRes.status, 200);
    assert.equal(resendData.success, true);
    assert.ok(resendData.challengeId, 'New challengeId must be returned on resend');
    assert.notEqual(resendData.challengeId, firstChallenge, 'New challengeId must differ from old');
    assert.equal(resendData.otp, undefined, 'otp MUST NOT appear in resend response');
    assert.equal(resendData.otpDebug, undefined, 'otpDebug MUST NOT appear in resend response');

    // Old OTP must now be invalidated; attempting to verify it must fail
    const oldVerify = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: firstOtp, challengeId: firstChallenge })
    });
    const oldData = await oldVerify.json();
    assert.equal(oldData.success, false, 'Old OTP must be invalidated after resend');
  });

  // ── PROTECTED ROUTE ACCESS ───────────────────────────────────────────────────
  await t.test('PROFILE: protected endpoint rejects unauthenticated request', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/profile`);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.notEqual(res.status, 200);
  });

  await t.test('PROFILE: protected endpoint accepts real JWT from OTP verification', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.user);
  });

  await t.test('PROFILE: rejects fake/demo JWT tokens', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer demo-jwt-token' }
    });
    const data = await res.json();
    assert.equal(data.success, false);
    assert.notEqual(res.status, 200);
  });

  // ── PASSWORD FLOWS ───────────────────────────────────────────────────────────
  await t.test('FORGOT-PASSWORD: rejects invalid email format', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('FORGOT-PASSWORD: returns success for valid email (no token leak in response)', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    // Reset URL and token must NOT be leaked in the response body
    assert.equal(data.resetUrlDebug, undefined, 'resetUrlDebug MUST NOT be in HTTP response');
    assert.equal(data.token, undefined, 'token MUST NOT be in forgot-password response');
  });

  await t.test('RESET-PASSWORD: rejects invalid reset token', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, token: 'invalid-bogus-token', newPassword: 'NewPass@2026!' })
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('RESET-PASSWORD: full reset flow updates password, allows login with new password, and rejects old password', async () => {
    // 1. Request password reset
    const forgotRes = await fetch(`http://localhost:${port}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const forgotData = await forgotRes.json();
    assert.equal(forgotRes.status, 200);
    assert.equal(forgotData.success, true);

    // 2. Retrieve token via test helper
    const resetToken = __getLatestResetTokenForTesting(testUser.email);
    assert.ok(resetToken, 'Reset token must be available for test environment');

    const newPassword = 'BrandNewPassword@2026!';

    // 3. Submit password reset with new password
    const resetRes = await fetch(`http://localhost:${port}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, token: resetToken, newPassword })
    });
    const resetData = await resetRes.json();
    assert.equal(resetRes.status, 200, `Reset failed: ${resetData.message}`);
    assert.equal(resetData.success, true);

    // 4. Token cannot be reused (single-use enforcement)
    const reuseRes = await fetch(`http://localhost:${port}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, token: resetToken, newPassword: 'AnotherPassword@2026!' })
    });
    const reuseData = await reuseRes.json();
    assert.equal(reuseRes.status, 400);
    assert.equal(reuseData.success, false);

    // 5. Old password must be rejected
    const oldLoginRes = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const oldLoginData = await oldLoginRes.json();
    assert.equal(oldLoginRes.status, 401, 'Old password must be rejected after reset');
    assert.equal(oldLoginData.success, false);

    // 6. New password must be accepted and issue OTP challenge
    const newLoginRes = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: newPassword })
    });
    const newLoginData = await newLoginRes.json();
    assert.equal(newLoginRes.status, 200, `Login with new password must succeed: ${newLoginData.message}`);
    assert.equal(newLoginData.success, true);
    assert.equal(newLoginData.step, 'verify-otp');
    assert.ok(newLoginData.challengeId, 'Challenge ID must be issued on successful login');

    // Update testUser.password for any subsequent tests
    testUser.password = newPassword;
  });

  // ── PRODUCTION DB GUARD ──────────────────────────────────────────────────────
  await t.test('DB GUARD: returns 503 in production when MongoDB is unavailable', async () => {
    // Temporarily simulate production with DB disconnected
    const originalEnv = process.env.NODE_ENV;
    __setDbOfflineForTesting(true);
    process.env.NODE_ENV = 'production';

    try {
      const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });
      const data = await res.json();

      assert.equal(res.status, 503);
      assert.equal(data.success, false);
    } finally {
      __setDbOfflineForTesting(false);
      process.env.NODE_ENV = originalEnv;
    }
  });

  // ── Teardown ─────────────────────────────────────────────────────────────────
  await t.test('TEARDOWN: stop test HTTP server', async () => {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    await mongoose.disconnect();
  });
});
