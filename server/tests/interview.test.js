process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';

test('AI Interview Prep API v1 Endpoints (/api/v1/interview)', async (t) => {
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

  await t.test('POST /api/v1/interview/session - Positive Case: Saves completed mock interview session', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dummyToken}`
      },
      body: JSON.stringify({
        role: 'Full Stack Engineer',
        difficulty: 'Intermediate',
        category: 'Technical & Coding',
        overallScore: 85,
        questionsCount: 3,
        feedbackSummary: 'Solid STAR structure and strong technical depth.',
        evaluations: [
          { question: 'Explain React Virtual DOM', overallScore: 88, feedback: 'Accurate and concise.' }
        ]
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.session);
  });

  await t.test('GET /api/v1/interview/history - Negative Case: Rejects unauthenticated request', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/interview/history`, {
      method: 'GET'
    });
    assert.equal(res.status, 401);
  });

  await t.test('Teardown test HTTP server instance', async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });
});
