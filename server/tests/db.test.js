import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

test('Database Connection & High-Availability Fallback Tests', async (t) => {
  await t.test('connectDB should execute cleanly without throwing unhandled exceptions', async () => {
    await assert.doesNotReject(async () => {
      await connectDB();
    });
  });

  await t.test('Mongoose bufferCommands setting should be explicitly set to false for instant fallback', () => {
    assert.equal(mongoose.get('bufferCommands'), false);
  });
});
