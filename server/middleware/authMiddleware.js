import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
console.log("===== AUTH MIDDLEWARE =====");
console.log("Method:", req.method);
console.log("URL:", req.originalUrl);
console.log("Authorization Header:", req.headers.authorization);

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerelevate_super_secret_jwt_key_2026_pro');
console.log("Decoded Token:", decoded);

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        req.user = {
          _id: decoded.id || 'usr-101',
          name: 'Candidate User',
          email: 'candidate@careerelevate.ai',
          targetRole: 'Senior Software Engineer'
        };
      }
console.log("Authenticated User:", req.user);
return next();
console.log("JWT ERROR:", error.message);
} catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};
