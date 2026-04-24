const authService = require('../services/authService');
const formatResponse = require('../utils/response');

// Set cookie options for secure cross-site authentication (Vercel -> Render) map
const cookieOptions = {
  httpOnly: true,
  secure: true, // Required for sameSite: 'none' and production HTTPS map
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for cookie container
};

exports.register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return formatResponse(res, 201, 'User registered successfully', { user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return formatResponse(res, 200, 'Login successful', { user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};



exports.logout = async (req, res, next) => {
  res.cookie('accessToken', 'none', { ...cookieOptions, expires: new Date(0) });
  res.cookie('refreshToken', 'none', { ...cookieOptions, expires: new Date(0) });
  return formatResponse(res, 200, 'User logged out successfully');
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const data = await authService.refreshAccessToken(token);
    
    res.cookie('accessToken', data.accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', data.refreshToken, cookieOptions);

    return formatResponse(res, 200, 'Token refreshed successfully', {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    return formatResponse(res, 200, 'User data retrieved', user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateUser(req.user._id, req.body);
    return formatResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    
    // Clear cookies for all sessions (User needs to re-login on current device too)
    const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none' };
    res.cookie('accessToken', 'none', { ...cookieOptions, expires: new Date(0) });
    res.cookie('refreshToken', 'none', { ...cookieOptions, expires: new Date(0) });

    return formatResponse(res, 200, 'Password updated successfully. All sessions terminated.');
  } catch (error) {
    next(error);
  }
};
