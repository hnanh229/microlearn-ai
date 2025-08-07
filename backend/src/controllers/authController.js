const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendgrid');

// Placeholder for sending email
const sendVerificationEmail = async (email, token) => {
  // TODO: Implement real email sending
  console.log(`Send verification email to ${email} with token: ${token}`);
};

exports.signup = async (req, res) => {
  try {
    console.log('[SIGNUP] Request body:', req.body);
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[SIGNUP] Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ email, password, verificationToken });
    console.log('[SIGNUP] User created:', user._id, user.email);
    await sendVerificationEmail(email, verificationToken);
    console.log('[SIGNUP] Verification email sent to:', email);
    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    console.error('[SIGNUP] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified.' });
    const token = signToken({ id: user._id, email: user.email });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' });
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    await user.save();
    await sendVerificationEmail(email, user.verificationToken);
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Test SendGrid email endpoint
exports.testSendGrid = async (req, res) => {
  try {
    await sendEmail({
      to: req.body.to || 'test@example.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    });
    res.json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};
