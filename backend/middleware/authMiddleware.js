import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded._id).select('role');
      if (!user) {
        throw new ApiError(401, 'User no longer exists');
      }
      req.user = { _id: user._id, role: user.role };
    } else {
      req.user = { _id: decoded._id, role: decoded.role || 'user' };
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized, token failed');
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, `Role (${req.user?.role}) is not allowed to access this resource`);
    }
    next();
  };
};
