import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshTokens = (user, res) => {
  const payload = {
    _id: user._id,
    role: user.role || 'user',
  };

  // Generate Access Token
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Generate Refresh Token
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );

  // Options for cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // Set cookies
  res.cookie('accessToken', accessToken, options);
  res.cookie('refreshToken', refreshToken, options);

  return { accessToken, refreshToken };
};
