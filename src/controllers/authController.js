/**
 * controllers/authController.js
 * Month 2 Auth APIs: register, verify-otp, login, forgot/reset password.
 *
 * Task requirements:
 * - bcrypt saltRounds: 12 for password hashing
 * - JWT HS256 payload: { userId, email, role } with expiry from JWT_EXPIRY (or JWT_EXPIRES_IN fallback)
 * - phone regex: /^[6-9]\\d{9}$/ (validated in routes)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const otpService = require('../utils/otpService');

const JWT_EXPIRY =
  process.env.JWT_EXPIRY ||
  process.env.JWT_EXPIRES_IN ||
  '30d';

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || '10', 10);
const OTP_HASH_ROUNDS = parseInt(process.env.OTP_HASH_ROUNDS || '10', 10);

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

const sanitizeUser = (user) => {
  const obj = user?.toObject ? user.toObject() : user;
  if (!obj) return obj;
  delete obj.passwordHash;
  delete obj.otp;
  delete obj.fcmToken;
  delete obj.__v;
  return obj;
};

// POST /auth/register (FR-01)
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, phone, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: 'Email already registered' });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists)
      return res.status(409).json({ message: 'Phone already registered' });

    const passwordHash = await bcrypt.hash(password, 12);

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, OTP_HASH_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      isVerified: false,
      otp: { code: hashedOtp, expiresAt: otpExpiresAt },
    });

    // try {
    //   await otpService.sendOtp({ phone, otp, purpose: 'register', userId: user._id });
    // } catch (e) {
    //   await User.deleteOne({ _id: user._id });
    //   return res.status(502).json({ message: 'Failed to send OTP. Please try again.' });
    // }
// --- ADD A MOCK LOG INSTEAD ---
    console.log(`DEBUG: OTP for ${phone} is ${otp}`);
    return res.status(201).json({
      userId: user._id,
      message: 'Registration successful. OTP sent to your mobile number.',
    });
  }  catch (err) {
    // THIS LINE IS CRUCIAL - It will print the real error in your terminal
    console.error("DEBUG REGISTER ERROR:", err); 

    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(409).json({ message: `${field} already registered` });
    }
    return res.status(500).json({ 
      message: 'Server error during registration',
      error: err.message // Temporarily send the message to Postman too
    });
  }
};

// POST /auth/verify-otp (FR-02)
exports.verifyOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId).select('+otp.code +otp.expiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await user.isOtpValid(otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    const token = signToken(user);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// POST /auth/login (FR-03)
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { email, phone, password } = req.body;

  try {
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });

    // Do not reveal if the phone exists
    if (!user) {
      return res.status(200).json({
        message: 'If this number is registered, an OTP has been sent.',
      });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, OTP_HASH_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    user.otp = { code: hashedOtp, expiresAt: otpExpiresAt };
    await user.save();

    await otpService.sendOtp({ phone, otp, purpose: 'forgot_password', userId: user._id });

    return res.status(200).json({
      userId: user._id,
      message: 'OTP sent to your registered mobile number.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { userId, otp, newPassword } = req.body;

  try {
    const user = await User.findById(userId).select('+otp.code +otp.expiresAt +passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await user.isOtpValid(otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.otp = { code: null, expiresAt: null };
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful. Please log in.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

