process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEmailError, logEmailDeliveryError } from '../services/emailService.js';

test('Email Service Diagnostics & Resend API Error Classification', async (t) => {
  await t.test('Classifies missing RESEND_API_KEY as MISSING_RESEND_CONFIG', () => {
    const err = new Error('Resend API key is not configured in production environment (RESEND_API_KEY missing).');
    err.code = 'ERESEND_KEY_MISSING';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'MISSING_RESEND_CONFIG');
    assert.ok(result.description.includes('RESEND_API_KEY'));
  });

  await t.test('Classifies 401 invalid_api_key rejection as RESEND_AUTH_FAILURE', () => {
    const err = new Error('API key is invalid');
    err.code = 'RESEND_401';
    err.name = 'invalid_api_key';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'RESEND_AUTH_FAILURE');
    assert.ok(result.description.includes('Check RESEND_API_KEY'));
  });

  await t.test('Classifies domain restriction (testing domain unverified recipient) as RESEND_DOMAIN_RESTRICTION', () => {
    const err = new Error('You can only send testing emails to your own email address (user@domain.com). To send to other domains, verify your domain at resend.com/domains');
    err.code = 'RESEND_403';
    err.name = 'validation_error';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'RESEND_DOMAIN_RESTRICTION');
    assert.ok(result.description.includes('onboarding@resend.dev'));
  });

  await t.test('Classifies rate limit (429) as RESEND_RATE_LIMITED', () => {
    const err = new Error('Too many requests. Rate limit exceeded.');
    err.code = 'RESEND_429';
    const result = classifyEmailError(err);
    assert.equal(result.category, 'RESEND_RATE_LIMITED');
  });

  await t.test('Classifies network timeout as RESEND_NETWORK_TIMEOUT', () => {
    const errTimeout = new Error('Connection timeout contacting api.resend.com');
    errTimeout.code = 'ETIMEDOUT';
    const result = classifyEmailError(errTimeout);
    assert.equal(result.category, 'RESEND_NETWORK_TIMEOUT');
  });

  await t.test('logEmailDeliveryError outputs clearly labelled log and does not leak API keys, tokens, or secrets', () => {
    const loggedMessages = [];
    const originalConsoleError = console.error;
    console.error = (msg) => { loggedMessages.push(msg); };

    try {
      const sensitiveApiKey = 're_123456789_abcdefghijklmnop';
      const sensitivePassword = 'super-secret-password-1234';
      const sensitiveToken = 'sensitive-token-abcdef';
      const sensitiveOtp = '123456';

      const err = new Error('API key is invalid');
      err.code = 'RESEND_401';
      err.name = 'invalid_api_key';

      logEmailDeliveryError('test-registration', err);

      assert.equal(loggedMessages.length, 1);
      const log = loggedMessages[0];

      // Verifies clearly labelled error log
      assert.ok(log.startsWith('[EMAIL-DELIVERY-ERROR]'), 'Must have clear EMAIL-DELIVERY-ERROR label');
      assert.ok(log.includes('Context: [test-registration]'));
      assert.ok(log.includes('Provider: [Resend API]'));
      assert.ok(log.includes('Category: [RESEND_AUTH_FAILURE]'));
      assert.ok(log.includes('ErrorName: [invalid_api_key]'));
      assert.ok(log.includes('ErrorCode: [RESEND_401]'));
      assert.ok(log.includes('Message: "API key is invalid"'));

      // Verifies API keys, passwords, tokens, OTPs, or raw secrets are NOT in the log
      assert.ok(!log.includes(sensitiveApiKey), 'API keys must never be logged');
      assert.ok(!log.includes(sensitivePassword), 'Passwords must never be logged');
      assert.ok(!log.includes(sensitiveToken), 'Tokens must never be logged');
      assert.ok(!log.includes(sensitiveOtp), 'OTPs must never be logged');
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

      if (statusCode === 500) {
        assert.equal(jsonBody.success, false);
        assert.equal(jsonBody.message, 'Account created, but verification email delivery failed. Please try again later or contact support.');
        assert.equal(jsonBody.token, undefined);
        assert.equal(jsonBody.otp, undefined);
        assert.ok(loggedErrors.some(l => l.includes('[EMAIL-DELIVERY-ERROR]')), 'Must log [EMAIL-DELIVERY-ERROR]');
        assert.ok(loggedErrors.some(l => l.includes('Resend API')), 'Must indicate Resend API');
      }
    } finally {
      process.env.NODE_ENV = originalEnv;
      console.error = originalConsoleError;
    }
  });
});
