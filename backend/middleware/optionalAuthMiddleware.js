import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

/** Attaches req.user when a valid token is present; continues as guest otherwise. */
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded._id).select('role');
      if (user) {
        req.user = { _id: user._id, role: user.role };
      }
    } else {
      req.user = { _id: decoded._id, role: decoded.role || 'user' };
    }
  } catch {
    // ignore invalid token — guest checkout
  }

  next();
};
