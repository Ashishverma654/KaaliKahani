const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT Access Token
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

// Generate JWT Refresh Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

exports.registerUser = async (userData) => {
  const { name, email, password, dob } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    dob,
    role
  });

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, accessToken, refreshToken };
};

exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide an email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account has been deactivated. Contact support.');
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, accessToken, refreshToken };
};

exports.refreshAccessToken = async (token) => {
  if (!token) {
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new Error('User not authorized or account deactivated');
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id); // Rotating the refresh token for security

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

exports.loginAdmin = async (email, password) => {
  const result = await exports.loginUser(email, password);
  
  // Verify admin status post-login verification
  const user = await User.findOne({ email });
  if (user?.role !== 'admin') {
    throw new Error('Access denied. Administrative privileges required for this endpoint.');
  }

  return result;
};
