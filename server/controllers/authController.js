import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// In-Memory Fallback User Store (for when MongoDB is offline)
const memoryUsers = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careerelevate_super_secret_jwt_key_2026_pro', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const emailLower = email.toLowerCase().trim();
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (isDbConnected()) {
      let user = await User.findOne({ email: emailLower });
      if (user && user.isVerified) {
        return res.status(400).json({ success: false, message: 'User account with this email already exists and is verified.' });
      }

      if (user && !user.isVerified) {
        user.name = name;
        user.password = password;
        user.targetRole = targetRole || user.targetRole;
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: emailLower,
          password,
          targetRole: targetRole || 'Senior Software Engineer',
          isVerified: false,
          otp,
          otpExpiresAt
        });
      }
    } else {
      let user = memoryUsers.get(emailLower);
      if (user && user.isVerified) {
        return res.status(400).json({ success: false, message: 'User account with this email already exists and is verified.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: `mem-usr-${Date.now()}`,
        name,
        email: emailLower,
        password: hashedPassword,
        targetRole: targetRole || 'Senior Software Engineer',
        isVerified: false,
        otp,
        otpExpiresAt,
        readinessScore: 75,
        streakDays: 1,
        skillsBreakdown: { technical: 80, communication: 75, problemSolving: 85, leadership: 70, starMethod: 80 },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      memoryUsers.set(emailLower, user);
    }

    await sendOTPEmail(emailLower, otp, name);

    res.status(200).json({
      success: true,
      message: `Registration successful! Verification OTP (${otp}) sent to your email.`,
      step: 'verify-otp',
      email: emailLower,
      otpDebug: otp
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP code' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = isDbConnected() ? await User.findOne({ email: emailLower }) : memoryUsers.get(emailLower);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          readinessScore: user.readinessScore,
          streakDays: user.streakDays,
          skillsBreakdown: user.skillsBreakdown,
          avatar: user.avatar
        }
      });
    }

    if (!user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code. Please check your code.' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    if (isDbConnected()) {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    await sendWelcomeEmail(user.email, user.name);

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to CareerElevate AI.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore,
        streakDays: user.streakDays,
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = isDbConnected() ? await User.findOne({ email: emailLower }) : memoryUsers.get(emailLower);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (isDbConnected()) {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    await sendOTPEmail(user.email, otp, user.name);

    res.status(200).json({
      success: true,
      message: `Fresh OTP code (${otp}) sent to your email.`,
      otpDebug: otp
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = isDbConnected() ? await User.findOne({ email: emailLower }) : memoryUsers.get(emailLower);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (isDbConnected()) {
      await user.save();
    } else {
      memoryUsers.set(emailLower, user);
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}?resetToken=${rawResetToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Link valid for 15 minutes.',
      resetUrlDebug: resetUrl
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, token, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({
        email: emailLower,
        resetPasswordToken: hashedResetToken,
        resetPasswordExpiresAt: { $gt: new Date() }
      });
    } else {
      const candidate = memoryUsers.get(emailLower);
      if (candidate && candidate.resetPasswordToken === hashedResetToken && new Date() < new Date(candidate.resetPasswordExpiresAt)) {
        user = candidate;
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    if (isDbConnected()) {
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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;
    let isPasswordMatch = false;

    if (isDbConnected()) {
      user = await User.findOne({ email: emailLower }).select('+password');
      if (user) {
        isPasswordMatch = await user.matchPassword(password);
      }
    } else {
      user = memoryUsers.get(emailLower);
      if (user) {
        isPasswordMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      if (isDbConnected()) {
        await user.save();
      } else {
        memoryUsers.set(emailLower, user);
      }

      await sendOTPEmail(user.email, otp, user.name);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: `Email not verified. Fresh OTP code (${otp}) sent.`,
        email: user.email,
        otpDebug: otp
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
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

export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
