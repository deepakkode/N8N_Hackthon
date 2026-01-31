const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/mysql');
const { auth } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, validateCollegeEmail } = require('../utils/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/check-user-exists
// @desc    Check if user already exists
// @access  Public
router.post('/check-user-exists', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    
    res.json({
      exists: !!existingUser,
      message: existingUser ? 'User already exists' : 'Email is available'
    });

  } catch (error) {
    console.error('Check user existence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user (student or organizer)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt received:', { 
      body: req.body,
      email: req.body?.email,
      userType: req.body?.userType
    });

    const { name, email, password, userType, year, department, section } = req.body;

    // Basic validation
    if (!name || !email || !password || !userType || !year || !department || !section) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['student', 'organizer'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Validate college email
    console.log('🔍 Validating email:', email);
    console.log('🏫 College domain:', process.env.COLLEGE_DOMAIN);
    const isValidEmail = validateCollegeEmail(email);
    console.log('✅ Email validation result:', isValidEmail);
    
    if (!isValidEmail) {
      console.log('❌ Email validation failed');
      return res.status(400).json({ 
        message: `Please use your college email address ending with @${process.env.COLLEGE_DOMAIN}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      userType,
      year,
      department,
      section,
      college: process.env.COLLEGE_NAME || 'KL University'
    });

    console.log('User created successfully:', { 
      id: user.id, 
      email: user.email, 
      userType: user.userType 
    });

    // Generate and send OTP
    const otp = user.generateOTP();
    await user.save();

    console.log('🔐 Generated OTP for user:', user.email);
    
    // Send OTP email
    try {
      const emailSent = await sendOTPEmail(user.email, otp, user.name);
      if (emailSent) {
        console.log('📧 OTP email sent successfully to:', user.email);
      } else {
        console.log('⚠️ Email service not configured, using bypass OTP');
      }
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError.message);
    }

    res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      userId: user.id,
      email: user.email,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/create-verified-user
// @desc    Create a verified user directly (after OTP verification)
// @access  Public
router.post('/create-verified-user', async (req, res) => {
  try {
    const { name, email, password, userType, year, department, section } = req.body;

    // Basic validation
    if (!name || !email || !password || !userType || !year || !department || !section) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create verified user directly
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      userType,
      year,
      department,
      section,
      college: process.env.COLLEGE_NAME || 'KL University',
      isEmailVerified: true // Create as already verified
    });

    console.log('✅ Verified user created:', { 
      id: user.id, 
      email: user.email, 
      userType: user.userType 
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        year: user.year,
        department: user.department,
        section: user.section,
        college: user.college,
        isEmailVerified: user.isEmailVerified,
        isClubVerified: user.isClubVerified,
        clubName: user.clubName
      }
    });

  } catch (error) {
    console.error('Create verified user error:', error);
    res.status(500).json({ message: 'Server error during user creation' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check OTP (allow bypass OTP for testing)
    const isValidOTP = user.emailOTP === otp || otp === '123456';
    const isOTPExpired = user.otpExpires && new Date() > user.otpExpires;

    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (isOTPExpired && otp !== '123456') {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.otpExpires = null;
    await user.save();

    console.log('✅ Email verified successfully for user:', user.email);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        year: user.year,
        department: user.department,
        section: user.section,
        college: user.college,
        isEmailVerified: user.isEmailVerified,
        isClubVerified: user.isClubVerified,
        clubName: user.clubName
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', { 
      body: req.body, 
      email: req.body?.email, 
      hasPassword: !!req.body?.password 
    });

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!email.includes('@')) {
      console.log('Invalid email format');
      return res.status(400).json({ message: 'Please enter a valid email' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { 
      id: user.id, 
      email: user.email, 
      isEmailVerified: user.isEmailVerified 
    });

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('Email not verified for user:', user.email);
      return res.status(400).json({ 
        message: 'Please verify your email first',
        needsVerification: true,
        userId: user.id
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user.email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        year: user.year,
        department: user.department,
        section: user.section,
        college: user.college,
        isEmailVerified: user.isEmailVerified,
        isClubVerified: user.isClubVerified,
        clubName: user.clubName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        userType: req.user.userType,
        year: req.user.year,
        department: req.user.department,
        section: req.user.section,
        college: req.user.college,
        isEmailVerified: req.user.isEmailVerified,
        isClubVerified: req.user.isClubVerified,
        clubName: req.user.clubName
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      const emailSent = await sendOTPEmail(user.email, otp, user.name);
      if (emailSent) {
        console.log('📧 New OTP email sent successfully to:', user.email);
      } else {
        console.log('⚠️ Email service not configured, using bypass OTP: 123456');
      }
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError.message);
    }

    res.json({
      message: 'New OTP sent successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;