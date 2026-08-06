process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';

test('Authentication API v1 Endpoints (/api/v1/auth)', async (t) => {
  let server;
  let port;

  await t.test('Start test HTTP server instance', async () => {
    server = app.listen(0);
    port = server.address().port;
  });

  const testUser = {
    name: 'Jest Candidate',
    email: `jest_candidate_${Date.now()}@careerelevate.ai`,
    password: 'password123',
    targetRole: 'Senior Software Engineer'
  };

  let generatedOtp = '';
  let authToken = '';

  await t.test('POST /api/v1/auth/register - Positive Case: Registers candidate and returns OTP', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.otpDebug);
    generatedOtp = data.otpDebug;
  });

  await t.test('POST /api/v1/auth/register - Negative Case: Rejects registration when email is missing', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Candidate', password: 'password123' })
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('POST /api/v1/auth/verify-otp - Positive Case: Verifies 6-digit OTP code and issues JWT', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: generatedOtp })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    authToken = data.token;
  });

  await t.test('POST /api/v1/auth/login - Positive Case: Logs in verified candidate', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
  });

  await t.test('POST /api/v1/auth/login - Negative Case: Rejects incorrect password', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  await t.test('GET /api/v1/auth/profile - Positive Case: Retrieves authenticated candidate profile', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.user);
  });

  await t.test('Teardown test HTTP server instance', async () => {
    server.close();
  });
});
