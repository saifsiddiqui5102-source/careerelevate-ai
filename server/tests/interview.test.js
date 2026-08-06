process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';

test('AI Interview Prep API v1 Endpoints (/api/v1/interview)', async (t) => {
  let server;
  let port;
  const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1lbS11c3ItMTc4NTc4NjQ3Mjg3MSIsImlhdCI6MTc4NTc4NjQ4OSwiZXhwIjoxNzg2MzkxMjg5fQ.YpS8DFA412jwhyVC0DDv2da91OgFYtsnfQUgN0Ch0r4';

  await t.test('Start test HTTP server instance', async () => {
    server = app.listen(0);
    port = server.address().port;
  });

  await t.test('GET /api/v1/interview/questions - Positive Case: Returns practice questions', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/questions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dummyToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.questions));
  });

  await t.test('POST /api/v1/interview/generate-questions - Positive Case: Generates 4-category dynamic question suite', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({
        jobRole: 'Senior Full Stack Engineer',
        skills: ['React', 'Node.js', 'System Design'],
        experienceYears: '5 Years'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.questions);
  });

  await t.test('POST /api/v1/interview/mock - Positive Case: Evaluates candidate mock interview answer', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/mock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({
        question: 'How do you handle microservice failures in production?',
        candidateAnswer: 'I implement circuit breaker patterns using Resilience4j and fallback handlers.'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.evaluation);
  });

  await t.test('GET /api/v1/interview/history - Positive Case: Returns interview history timeline', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/history`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dummyToken}` }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.history));
  });

  await t.test('Teardown test HTTP server instance', async () => {
    server.close();
  });
});
