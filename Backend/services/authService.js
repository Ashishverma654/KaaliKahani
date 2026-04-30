const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

// Generate JWT Access Token
const signAccessToken = (id, tokenVersion) => {
  return jwt.sign({ id: id.toString(), tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

// Generate JWT Refresh Token
const signRefreshToken = (id, tokenVersion) => {
  return jwt.sign({ id: id.toString(), tokenVersion }, process.env.REFRESH_SECRET, {
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

  const role = 'user';

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    dob,
    role
  });

  const accessToken = signAccessToken(user._id, user.tokenVersion);
  const refreshToken = signRefreshToken(user._id, user.tokenVersion);

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, accessToken, refreshToken };
};

exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ErrorResponse('Please provide an email and password', 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail }).select('+password');
  
  if (!user) {
    console.log(`Login failed: User with email ${cleanEmail} not found`);
    throw new ErrorResponse('Invalid credentials', 401);
  }

  console.log(`User found: ${user.email}. Provided password length: ${password.length}. Stored hash length: ${user.password?.length}`);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log(`Login failed: Password mismatch for user ${cleanEmail}`);
    throw new ErrorResponse('Invalid credentials', 401);
  }
  
  if (!user.isActive) {
    throw new ErrorResponse('Account has been deactivated. Contact support.', 403);
  }

  const accessToken = signAccessToken(user._id, user.tokenVersion);
  const refreshToken = signRefreshToken(user._id, user.tokenVersion);

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

    const accessToken = signAccessToken(user._id, user.tokenVersion);
    const refreshToken = signRefreshToken(user._id, user.tokenVersion); // Rotating the refresh token for security

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};



exports.updateUser = async (userId, updateData) => {
  const { name, dob, gender, avatar } = updateData;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (dob) user.dob = dob;
  if (gender) user.gender = gender;
  if (avatar) user.avatar = avatar;

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return safeUser;
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  // Increment tokenVersion to invalidate all other active sessions globally
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  
  await user.save();
  return true;
};
