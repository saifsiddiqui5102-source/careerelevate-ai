import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail, logEmailDeliveryError } from '../services/emailService.js';

// In-Memory Fallback User Store (only used in development/testing when MongoDB is offline)
export const memoryUsers = new Map();

// Test-only memory store for automated tests to query OTP without exposing it in API responses
const testOtpStore = new Map();

export const __getLatestOtpForTesting = (email) => {
  if (process.env.NODE_ENV !== 'test') return null;
  return testOtpStore.get(email.toLowerCase().trim()) || null;
};

export const getMemoryUserById = (id) => {
  for (const user of memoryUsers.values()) {
    if (String(user._id) === String(id)) {
      return user;
    }
  }
  return null;
};

let forceDbOfflineForTesting = false;
export const __setDbOfflineForTesting = (offline) => {
  forceDbOfflineForTesting = Boolean(offline);
};

const isDbConnected = () => !forceDbOfflineForTesting && mongoose.connection.readyState === 1;

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const generateChallengeId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(24).toString('hex');
};

const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production');
  }
  return process.env.JWT_SECRET || 'careerelevate_super_secret_jwt_key_2026_pro';
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const emailLower = email.toLowerCase().trim();
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const challengeId = generateChallengeId();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (process.env.NODE_ENV === 'test') {
      testOtpStore.set(emailLower, otp);
    }

    if (isDbConnected()) {
      let user = await User.findOne({ email: emailLower });
      if (user && user.isVerified) {
        return res.status(400).json({ success: false, message: 'User account with this email already exists and is verified.' });
      }

      if (user && !user.isVerified) {
        user.name = name;
        user.password = password; // pre-save hook hashes password
        user.targetRole = targetRole || user.targetRole;
        user.otpHash = otpHash;
        user.otpExpiresAt = otpExpiresAt;
        user.otpAttempts = 0;
        user.otpChallengeId = challengeId;
        user.otpPurpose = 'registration';
        user.lastOtpSentAt = new Date();
        await user.save();
      } else {
        user = await User.create({
          name,
          email: emailLower,
          password,
          targetRole: targetRole || 'Senior Software Engineer',
          isVerified: false,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          otpChallengeId: challengeId,
          otpPurpose: 'registration',
          lastOtpSentAt: new Date()
        });
      }
    } else {
      let user = memoryUsers.get(emailLower);
      if (user && user.isVerified) {
        return res.status(400).json({ success: false, message: 'User account with this email already exists and is verified.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: user?._id || `mem-usr-${Date.now()}`,
        name,
        email: emailLower,
        password: hashedPassword,
        targetRole: targetRole || 'Senior Software Engineer',
        isVerified: false,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpChallengeId: challengeId,
        otpPurpose: 'registration',
        lastOtpSentAt: new Date(),
        readinessScore: 75,
        streakDays: 1,
        skillsBreakdown: { technical: 80, communication: 75, problemSolving: 85, leadership: 70, starMethod: 80 },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      memoryUsers.set(emailLower, user);
    }

    try {
      await sendOTPEmail(emailLower, otp, name, 'registration');
    } catch (emailErr) {
      logEmailDeliveryError('registration', emailErr);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Account created, but verification email delivery failed. Please try again later or contact support.'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Registration successful! Verification code sent to your email.',
      step: 'verify-otp',
      requiresOtp: true,
      email: emailLower,
      challengeId
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;
    let isPasswordMatch = false;

    if (isDbConnected()) {
      user = await User.findOne({ email: emailLower }).select('+password +otpHash +otpChallengeId');
      if (!user && process.env.NODE_ENV !== 'production') {
        user = memoryUsers.get(emailLower);
      }
      if (user && typeof user.matchPassword === 'function') {
        isPasswordMatch = await user.matchPassword(password);
      } else if (user) {
        isPasswordMatch = await bcrypt.compare(password, user.password);
      }
    } else {
      user = memoryUsers.get(emailLower);
      if (user) {
        isPasswordMatch = await bcrypt.compare(password, user.password);
      }
    }

    // Generic error for invalid credentials - DO NOT send OTP
    if (!user || !isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate cryptographically secure OTP challenge
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const challengeId = generateChallengeId();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (process.env.NODE_ENV === 'test') {
      testOtpStore.set(emailLower, otp);
    }

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    user.otpChallengeId = challengeId;
    user.otpPurpose = user.isVerified ? 'login' : 'registration';
    user.lastOtpSentAt = new Date();

    if (user && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    try {
      await sendOTPEmail(user.email, otp, user.name, user.otpPurpose);
    } catch (emailErr) {
      logEmailDeliveryError('login', emailErr);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Credentials verified, but verification email delivery failed. Please try again later or contact support.'
        });
      }
    }

    // Two-step login requirement: DO NOT issue a JWT token here!
    res.status(200).json({
      success: true,
      step: 'verify-otp',
      requiresOtp: true,
      message: 'Verification code sent to your email. Please enter the 6-digit code to complete sign-in.',
      email: user.email,
      challengeId
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { email, otp, challengeId } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit verification code.' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({ email: emailLower }).select('+otpHash +otpChallengeId');
      if (!user && process.env.NODE_ENV !== 'production') {
        user = memoryUsers.get(emailLower);
      }
    } else {
      user = memoryUsers.get(emailLower);
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification request.' });
    }

    // Validate challenge ID if provided
    if (challengeId && user.otpChallengeId && challengeId !== user.otpChallengeId) {
      return res.status(400).json({ success: false, message: 'Invalid or outdated challenge session. Please request a new code.' });
    }

    // Ensure an OTP challenge is active
    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No active verification code found. Please request a new code.' });
    }

    // Check expiry (5 minutes limit)
    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpChallengeId = undefined;
      user.otpAttempts = 0;
      if (user && typeof user.save === 'function') await user.save();
      else memoryUsers.set(emailLower, user);

      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    // Check attempt limits (max 5 attempts)
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    if (user.otpAttempts > 5) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpChallengeId = undefined;
      user.otpAttempts = 0;
      if (user && typeof user.save === 'function') await user.save();
      else memoryUsers.set(emailLower, user);

      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a fresh code.'
      });
    }

    // Compare hash of entered code
    const enteredHash = hashOtp(otp);
    if (enteredHash !== user.otpHash) {
      if (user && typeof user.save === 'function') await user.save();
      else memoryUsers.set(emailLower, user);

      const attemptsRemaining = Math.max(0, 5 - user.otpAttempts);
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${attemptsRemaining} attempt(s) remaining.`,
        attemptsRemaining
      });
    }

    // Invalidate OTP immediately to prevent reuse
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpChallengeId = undefined;
    user.otpAttempts = 0;

    const wasUnverified = !user.isVerified;
    user.isVerified = true;

    if (user && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    if (wasUnverified) {
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (e) {
        logEmailDeliveryError('welcome-email', e);
      }
    }

    // Only issue real JWT after successful OTP verification
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome to CareerElevate AI!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore || 75,
        streakDays: user.streakDays || 1,
        skillsBreakdown: user.skillsBreakdown,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({ email: emailLower });
      if (!user && process.env.NODE_ENV !== 'production') {
        user = memoryUsers.get(emailLower);
      }
    } else {
      user = memoryUsers.get(emailLower);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Enforce 60-second cooldown rate limit
    const now = Date.now();
    if (user.lastOtpSentAt) {
      const elapsedMs = now - new Date(user.lastOtpSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} second(s) before requesting a new code.`,
          retryAfterSeconds: waitSeconds
        });
      }
    }

    // Invalidate previous code and issue fresh OTP
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const challengeId = generateChallengeId();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (process.env.NODE_ENV === 'test') {
      testOtpStore.set(emailLower, otp);
    }

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    user.otpChallengeId = challengeId;
    user.lastOtpSentAt = new Date();

    if (user && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    try {
      await sendOTPEmail(user.email, otp, user.name, user.otpPurpose || 'login');
    } catch (emailErr) {
      logEmailDeliveryError('resend-otp', emailErr);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Failed to dispatch verification code email. Please try again later.'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      challengeId
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({ email: emailLower });
      if (!user && process.env.NODE_ENV !== 'production') {
        user = memoryUsers.get(emailLower);
      }
    } else {
      user = memoryUsers.get(emailLower);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (user && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}?resetToken=${rawResetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
    } catch (emailErr) {
      logEmailDeliveryError('forgot-password', emailErr);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again later.'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Link valid for 15 minutes.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database service is currently unavailable. Please try again later.' });
    }

    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, token, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({
        email: emailLower,
        resetPasswordToken: hashedResetToken,
        resetPasswordExpiresAt: { $gt: new Date() }
      }).select('+password');
      if (!user && process.env.NODE_ENV !== 'production') {
        const candidate = memoryUsers.get(emailLower);
        if (candidate && candidate.resetPasswordToken === hashedResetToken && new Date() < new Date(candidate.resetPasswordExpiresAt)) {
          user = candidate;
        }
      }
    } else {
      const candidate = memoryUsers.get(emailLower);
      if (candidate && candidate.resetPasswordToken === hashedResetToken && new Date() < new Date(candidate.resetPasswordExpiresAt)) {
        user = candidate;
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    if (user && typeof user.save === 'function') {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
