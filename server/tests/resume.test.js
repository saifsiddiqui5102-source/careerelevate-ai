process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';

test('Resume Management API v1 Endpoints (/api/v1/resume)', async (t) => {
  let server;
  let port;
  const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1lbS11c3ItMTc4NTc4NjQ3Mjg3MSIsImlhdCI6MTc4NTc4NjQ4OSwiZXhwIjoxNzg2MzkxMjg5fQ.YpS8DFA412jwhyVC0DDv2da91OgFYtsnfQUgN0Ch0r4';

  await t.test('Start test HTTP server instance', async () => {
    server = app.listen(0);
    port = server.address().port;
  });

  await t.test('POST /api/v1/resume/analyze - Positive Case: Analyzes resume text and generates 11-pillar ATS report', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/resume/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({
        resumeText: 'Senior Software Engineer with 6 years experience in React, Node.js, Express, MongoDB, Redis, AWS Lambda, GraphQL. Architected microservices handling 10k req/sec and reduced latency by 35%.',
        resumeTitle: 'Jest Full Stack Resume 2026'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.analysisData);
    assert.ok(data.analysisData.overallScore >= 50);
  });

  await t.test('POST /api/v1/resume/analyze - Negative Case: Rejects empty resume text', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/resume/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({ resumeText: '' })
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  await t.test('GET /api/v1/resume/versions - Positive Case: Returns resume versions list', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/resume/versions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dummyToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.versions));
  });

  await t.test('POST /api/v1/resume/compare - Positive Case: Compares two resume versions', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/resume/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({ version1Id: 'v-101', version2Id: 'v-102' })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.comparison);
  });

  await t.test('Teardown test HTTP server instance', async () => {
    server.close();
  });
});
