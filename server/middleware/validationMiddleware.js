// Pure Native Request Validator Suite

const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// Auth Registration Validation
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters)');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  next();
};

// Auth Login Validation
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  next();
};

// OTP Verification Validation
export const validateVerifyOTP = (req, res, next) => {
  const { email, otp } = req.body || {};
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
    errors.push('6-digit OTP verification PIN is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  next();
};

// Forgot Password Validation
export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid registered email address'
    });
  }
  next();
};

// Reset Password Validation
export const validateResetPassword = (req, res, next) => {
  const { email, token, newPassword } = req.body || {};
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!token) {
    errors.push('Reset token is required');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  next();
};
