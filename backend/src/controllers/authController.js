const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');

const sendVerificationEmail = async (email, token) => {
  const subject = 'Verify your MicroLearn account';
  const verifyInstructions = `Use this token to verify your account: ${token}`;
  const html = `
    <p>Thanks for signing up for MicroLearn!</p>
    <p>Please verify your email using this token:</p>
    <pre style="font-size:16px;padding:12px;background:#f5f5f5;border-radius:6px;">${token}</pre>
    <p>If your app supports a link, you can also click:
    <br />
    <a href="${process.env.CLIENT_VERIFY_URL || 'http://localhost:5173'}?token=${token}">Verify my email</a></p>
    <p style="color:#666;font-size:14px;margin-top:20px;">
      ⏰ This verification link will expire in 24 hours. If it expires, you can request a new verification email from the login page.
    </p>
  `;
  await sendEmail({ to: email, subject, text: verifyInstructions, html });
};

exports.signup = async (req, res) => {
  try {
    console.log('[SIGNUP] Request body:', req.body);
    const { firstName, lastName, email, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: firstName, lastName, email, password' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[SIGNUP] Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered.' });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const user = await User.create({ 
      firstName, 
      lastName, 
      email, 
      password, 
      verificationToken,
      verificationTokenExpires 
    });
    console.log('[SIGNUP] User created:', user._id, user.email);
    
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('[SIGNUP] Verification email sent to:', email);
      res.status(201).json({ message: 'User registered. Please verify your email.' });
    } catch (emailError) {
      console.error('[SIGNUP] Email sending failed:', emailError.message);
      // Still create the user but inform about email issue
      res.status(201).json({ 
        message: 'User registered but verification email failed to send. Please contact support.' 
      });
    }
  } catch (err) {
    console.error('[SIGNUP] Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });
    
    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ verificationToken: token });
      if (expiredUser) {
        return res.status(400).json({ message: 'Verification token has expired. Please request a new verification email.' });
      }
      return res.status(400).json({ message: 'Invalid verification token.' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    console.log('[VERIFY] Email verified for user:', user.email);
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('[VERIFY] Error:', err);
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
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();
    await sendVerificationEmail(email, user.verificationToken);
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Test email endpoint (Nodemailer)
exports.testEmail = async (req, res) => {
  try {
    await sendEmail({
      to: req.body.to || 'test@example.com',
      subject: 'Test email from MicroLearn',
      text: 'This is a plain-text test email sent via Nodemailer (Gmail).',
      html: '<strong>This is a test email sent via Nodemailer (Gmail).</strong>',
    });
    res.json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

// Debug endpoint to check environment variables
exports.debugConfig = async (req, res) => {
  res.json({
    message: 'Server is running',
    emailConfig: {
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
    }
  });
};
