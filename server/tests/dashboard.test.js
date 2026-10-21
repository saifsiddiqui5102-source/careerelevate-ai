process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../server.js';

test('Dashboard Analytics API v1 Endpoints (/api/v1/dashboard)', async (t) => {
  let server;
  let port;
  const dummyToken = jwt.sign(
    { id: 'mem-usr-101' },
    process.env.JWT_SECRET || 'careerelevate_super_secret_jwt_key_2026_pro',
    { expiresIn: '7d' }
  );

  await t.test('Start test HTTP server instance', async () => {
    server = app.listen(0);
    port = server.address().port;
  });

  await t.test('GET /api/v1/dashboard - Positive Case: Returns complete SaaS dashboard analytics suite', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/dashboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dummyToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.summaryCards);
    assert.ok(data.charts);
    assert.ok(data.aiInsights);
    assert.ok(data.progress);
    assert.ok(data.performance);
  });

  await t.test('GET /api/v1/dashboard/analytics - Positive Case: Returns analytics metrics', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/dashboard/analytics`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dummyToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });

  await t.test('Teardown test HTTP server instance', async () => {
    server.close();
  });
});
