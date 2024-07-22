const User = require('../models/User');
const generateOTP = require('../utils/otpGenerator'); // Correct path
const sendEmail = require('../utils/emailService');
const generateToken = require('../utils/tokenManager');
const bcrypt = require('bcryptjs');

// ... (rest of the code)

exports.register = async (req, res) => {
  const { name, password, phoneNumber, email } = req.body;
  if (!name || !password || !phoneNumber || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = new User({ name, password: hashedPassword, phoneNumber, email });
  await user.save();
  res.status(201).json({ message: 'Registration successful. Please verify your email.' });
};

exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Email not registered' });
  }

  const otp = generateOTP(process.env.OTP_LENGTH);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
  user.otp = bcrypt.hashSync(otp, 10);
  user.otpExpires = otpExpires;
  await user.save();

  sendEmail(email, otp);
  res.status(200).json({ message: 'OTP sent to your email.' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Email not registered' });
  }

  if (!user.otp || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  const isOtpValid = bcrypt.compareSync(otp, user.otp);
  if (!isOtpValid) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(user.email);
  res.status(200).json({ message: 'Login successful.', token });
};
