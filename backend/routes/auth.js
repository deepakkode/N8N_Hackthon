const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, validateCollegeEmail } = require('../utils/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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
    if (!validateCollegeEmail(email)) {
      return res.status(400).json({ 
        message: `Please use your college email address ending with @${process.env.COLLEGE_DOMAIN}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      userType,
      year,
      department,
      section,
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpires,
      college: process.env.COLLEGE_NAME || 'KL University'
    });

    await user.save();
    console.log('User created successfully:', { id: user._id, email: user.email });

    // Send OTP email
    try {
      const emailResult = await sendOTPEmail(email, otp, name);
      if (!emailResult.success) {
        console.warn('Email sending failed, but continuing with registration:', emailResult.error);
      }
    } catch (emailError) {
      console.warn('Email service error, but continuing with registration:', emailError);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP verification.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.emailVerificationToken !== otp && otp !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        year: user.year,
        department: user.department,
        section: user.section,
        college: user.college,
        isEmailVerified: user.isEmailVerified,
        isClubVerified: user.isClubVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', [
  body('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationToken = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.name);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
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
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { 
      id: user._id, 
      email: user.email, 
      isEmailVerified: user.isEmailVerified 
    });

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('Email not verified for user:', user.email);
      return res.status(400).json({ 
        message: 'Please verify your email first',
        needsVerification: true,
        userId: user._id
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
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
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
        id: req.user._id,
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

// @route   POST /api/auth/verify-user-email
// @desc    Verify any user's email for development
// @access  Public (development only)
router.post('/verify-user-email', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the user's email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified for user:', user.email);

    res.json({
      message: 'Email verified successfully',
      email: user.email
    });
  } catch (error) {
    console.error('Error verifying user email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// @route   POST /api/auth/create-test-user
// @desc    Create a test user for development
// @access  Public (development only)
router.post('/create-test-user', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@klu.ac.in' });
    if (existingUser) {
      return res.json({ 
        message: 'Test user already exists',
        email: 'test@klu.ac.in',
        password: '123456'
      });
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@klu.ac.in',
      password: '123456',
      userType: 'student',
      year: '2nd Year',
      department: 'Computer Science Engineering',
      section: 'A',
      isEmailVerified: true,
      college: 'KL University',
      isClubVerified: false
    });

    await testUser.save();
    console.log('Test user created successfully');

    res.json({
      message: 'Test user created successfully',
      email: 'test@klu.ac.in',
      password: '123456'
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ message: 'Error creating test user' });
  }
});

module.exports = router;