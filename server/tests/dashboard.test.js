process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';

test('Dashboard Analytics API v1 Endpoints (/api/v1/dashboard)', async (t) => {
  let server;
  let port;
  const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1lbS11c3ItMTc4NTc4NjQ3Mjg3MSIsImlhdCI6MTc4NTc4NjQ4OSwiZXhwIjoxNzg2MzkxMjg5fQ.YpS8DFA412jwhyVC0DDv2da91OgFYtsnfQUgN0Ch0r4';

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
