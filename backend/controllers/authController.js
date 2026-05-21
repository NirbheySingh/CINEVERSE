import User from '../models/User.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateAccessAndRefreshTokens } from '../utils/generateToken.js';

const formatAuthUser = (user, accessToken) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  accessToken,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database unavailable. Start MongoDB and try again.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const { accessToken } = generateAccessAndRefreshTokens(user, res);

  return res.status(201).json(
    new ApiResponse(201, formatAuthUser(user, accessToken), 'User registered successfully')
  );
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database unavailable. Start MongoDB and try again.');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken } = generateAccessAndRefreshTokens(user, res);

  return res.status(200).json(
    new ApiResponse(200, formatAuthUser(user, accessToken), 'User logged in successfully')
  );
});

// @desc    Admin-only login
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database unavailable. Start MongoDB and try again.');
  }

  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  const { accessToken } = generateAccessAndRefreshTokens(user, res);

  return res.status(200).json(
    new ApiResponse(200, formatAuthUser(user, accessToken), 'Admin logged in successfully')
  );
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('accessToken', '', { ...options, maxAge: 0 });
  res.cookie('refreshToken', '', { ...options, maxAge: 0 });

  return res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database unavailable');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      'User profile fetched'
    )
  );
});
