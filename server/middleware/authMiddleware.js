import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { getMemoryUserById } from '../controllers/authController.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      if (process.env.NODE_ENV === 'production' && !secret) {
        console.error('FATAL: JWT_SECRET environment variable is missing in production');
        return res.status(500).json({ success: false, message: 'Authentication server configuration error' });
      }

      const decoded = jwt.verify(token, secret || 'careerelevate_super_secret_jwt_key_2026_pro');

      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          req.user = await User.findById(decoded.id).select('-password');
        }
        if (!req.user && process.env.NODE_ENV !== 'production') {
          req.user = getMemoryUserById(decoded.id);
        }
      } else if (process.env.NODE_ENV !== 'production') {
        req.user = getMemoryUserById(decoded.id) || {
          _id: decoded.id || 'mem-usr-101',
          name: 'Test Candidate',
          email: 'test@careerelevate.ai',
          targetRole: 'Senior Software Engineer'
        };
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user account not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
};
