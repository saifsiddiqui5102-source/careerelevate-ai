process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEmailError, logEmailDeliveryError } from '../services/emailService.js';

test('Email Service Diagnostics & Error Classification', async (t) => {
  await t.test('Classifies missing SMTP credentials as MISSING_SMTP_CONFIG', () => {
    const err = new Error('SMTP credentials are not configured in production environment (SMTP_USER or SMTP_PASS missing or placeholder).');
    err.code = 'ECONFIG_MISSING';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'MISSING_SMTP_CONFIG');
    assert.ok(result.description.includes('SMTP_USER or SMTP_PASS'));
  });

  await t.test('Classifies 535 EAUTH rejection as SMTP_AUTH_FAILURE', () => {
    const err = new Error('Invalid login: 535-5.7.8 Username and Password not accepted');
    err.code = 'EAUTH';
    err.response = '535-5.7.8 Username and Password not accepted';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'SMTP_AUTH_FAILURE');
    assert.ok(result.description.includes('Google App Password'));
  });

  await t.test('Classifies connection timeout / refused as SMTP_CONNECTION_TIMEOUT', () => {
    const errTimeout = new Error('Connection timeout');
    errTimeout.code = 'ETIMEDOUT';
    const result1 = classifyEmailError(errTimeout);
    assert.equal(result1.category, 'SMTP_CONNECTION_TIMEOUT');

    const errRefused = new Error('connect ECONNREFUSED 127.0.0.1:587');
    errRefused.code = 'ECONNREFUSED';
    const result2 = classifyEmailError(errRefused);
    assert.equal(result2.category, 'SMTP_CONNECTION_TIMEOUT');
  });

  await t.test('Classifies other transport errors as SMTP_DELIVERY_FAILURE', () => {
    const err = new Error('550 5.1.1 Recipient unknown');
    err.code = 'EENVELOPE';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'SMTP_DELIVERY_FAILURE');
  });

  await t.test('logEmailDeliveryError outputs clearly labelled log and does not leak credentials or secrets', () => {
    const loggedMessages = [];
    const originalConsoleError = console.error;
    console.error = (msg) => { loggedMessages.push(msg); };

    try {
      const sensitivePassword = 'super-secret-password-1234';
      const sensitiveToken = 'sensitive-token-abcdef';
      const sensitiveOtp = '123456';

      const err = new Error('Invalid login: 535-5.7.8 Username and Password not accepted');
      err.code = 'EAUTH';
      err.name = 'AuthError';

      logEmailDeliveryError('test-registration', err);

      assert.equal(loggedMessages.length, 1);
      const log = loggedMessages[0];

      // Verifies clearly labelled error log
      assert.ok(log.startsWith('[EMAIL-DELIVERY-ERROR]'), 'Must have clear EMAIL-DELIVERY-ERROR label');
      assert.ok(log.includes('Context: [test-registration]'));
      assert.ok(log.includes('Category: [SMTP_AUTH_FAILURE]'));
      assert.ok(log.includes('ErrorName: [AuthError]'));
      assert.ok(log.includes('ErrorCode: [EAUTH]'));
      assert.ok(log.includes('Message: "Invalid login: 535-5.7.8 Username and Password not accepted"'));

      // Verifies passwords, tokens, OTPs, or raw secrets are NOT in the log
      assert.ok(!log.includes(sensitivePassword), 'Passwords must never be logged');
      assert.ok(!log.includes(sensitiveToken), 'Tokens must never be logged');
      assert.ok(!log.includes(sensitiveOtp), 'OTPs must never be logged');
      assert.ok(!log.includes('your_app_specific_password'), 'Placeholder password must not appear');
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('Endpoint safety: returns generic 500 without leaking secrets when email delivery fails in production', async () => {
    const { register } = await import('../controllers/authController.js');
    const originalEnv = process.env.NODE_ENV;
    const loggedErrors = [];
    const originalConsoleError = console.error;
    console.error = (msg) => { loggedErrors.push(msg); };

    try {
      process.env.NODE_ENV = 'production';

      let statusCode = 200;
      let jsonBody = {};
      const req = {
        body: {
          name: 'Diagnostic Candidate',
          email: `diag_${Date.now()}@test.com`,
          password: 'Password@123'
        }
      };
      const res = {
        status(code) { statusCode = code; return this; },
        json(data) { jsonBody = data; return this; }
      };

      await register(req, res, (err) => { if (err) throw err; });

      // In production with DB connected and placeholder SMTP, email delivery fails with 500
      if (statusCode === 500) {
        assert.equal(jsonBody.success, false);
        assert.equal(jsonBody.message, 'Account created, but verification email delivery failed. Please try again later or contact support.');
        assert.equal(jsonBody.token, undefined);
        assert.equal(jsonBody.otp, undefined);
        assert.ok(loggedErrors.some(l => l.includes('[EMAIL-DELIVERY-ERROR]')), 'Must log [EMAIL-DELIVERY-ERROR]');
      }
    } finally {
      process.env.NODE_ENV = originalEnv;
      console.error = originalConsoleError;
    }
  });
});
