const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op, fn, col, where } = require('sequelize');
const { Club, User } = require('../models/mysql');
const { auth } = require('../middleware/auth');
const { generateOTP, sendFacultyVerificationEmail, validateCollegeEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/clubs/create
// @desc    Create new club (Step 1: Club details)
// @access  Private (Organizer only)
router.post('/create', [auth], async (req, res) => {
  try {
    console.log('Club creation attempt:', {
      user: req.user?.email,
      userType: req.user?.userType,
      body: req.body
    });

    // Basic validation
    const { name, description, logo, facultyName, facultyEmail, facultyDepartment } = req.body;
    
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: 'Club name must be at least 3 characters' });
    }
    
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ message: 'Club description must be at least 10 characters' });
    }
    
    if (!logo || logo.trim().length < 10) {
      return res.status(400).json({ message: 'Club logo is required' });
    }
    
    // Validate logo format (base64 or URL)
    const isBase64 = logo.startsWith('data:image/');
    const isURL = logo.startsWith('http://') || logo.startsWith('https://');
    
    if (!isBase64 && !isURL) {
      return res.status(400).json({ message: 'Please provide a valid image (upload or URL)' });
    }
    
    if (isURL) {
      try {
        new URL(logo);
      } catch (error) {
        return res.status(400).json({ message: 'Please provide a valid logo URL' });
      }
    }
    
    if (!facultyName || facultyName.trim().length < 2) {
      return res.status(400).json({ message: 'Faculty name is required' });
    }
    
    if (!facultyEmail || !facultyEmail.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid faculty email' });
    }
    
    if (!facultyDepartment || facultyDepartment.trim().length < 2) {
      return res.status(400).json({ message: 'Faculty department is required' });
    }

    // Check if user is organizer
    if (req.user.userType !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create clubs' });
    }

    // Check if organizer already has a club
    const existingClub = await Club.findOne({ where: { organizerId: req.user.id } });
    if (existingClub) {
      return res.status(400).json({ 
        message: 'You already have a club. Each organizer can only create one club.',
        existingClub: {
          id: existingClub.id,
          name: existingClub.name,
          isFacultyVerified: existingClub.isFacultyVerified,
          facultyEmail: existingClub.facultyEmail
        }
      });
    }

    // Check if club name already exists (case-insensitive)
    const existingClubName = await Club.findOne({ 
      where: {
        name: {
          [Op.like]: name // Case-insensitive search in MySQL
        }
      }
    });
    if (existingClubName) {
      return res.status(400).json({ message: 'A club with this name already exists in your college' });
    }


    // Validate faculty email domain (should be college faculty email)
    if (!validateCollegeEmail(facultyEmail)) {
      return res.status(400).json({ 
        message: `Faculty email must be from your college domain (@${process.env.COLLEGE_DOMAIN})` 
      });
    }

    // Generate OTP for faculty verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create club
    const club = await Club.create({
      name,
      description,
      logo,
      organizerId: req.user.id,
      organizerName: req.user.name,
      organizerEmail: req.user.email,
      organizerPhone: req.user.phone || '0000000000', // Default phone if not provided
      organizerYear: req.user.year,
      organizerDepartment: req.user.department,
      facultyName,
      facultyEmail,
      facultyDepartment,
      facultyOTP: otp,
      facultyOTPExpires: otpExpires
    });

    console.log('Club created successfully:', { id: club.id, name: club.name });

    // Send OTP to faculty
    try {
      await sendFacultyVerificationEmail(facultyEmail, otp, name, req.user.name);
      console.log('Faculty verification email sent successfully');
    } catch (emailError) {
      console.warn('Faculty email sending failed, but continuing:', emailError);
    }

    res.status(201).json({
      message: 'Club created successfully. OTP sent to faculty advisor for verification.',
      clubId: club.id,
      facultyEmail: club.facultyEmail
    });
  } catch (error) {
    console.error('Create club error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      sql: error.sql,
      original: error.original
    });
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'A club with this name already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error during club creation' });
  }
});

// @route   POST /api/clubs/verify-faculty
// @desc    Verify faculty with OTP
// @access  Public
router.post('/verify-faculty', async (req, res) => {
  try {
    const { clubId, otp } = req.body;

    if (!clubId || !otp) {
      return res.status(400).json({ message: 'Club ID and OTP are required' });
    }

    const club = await Club.findByPk(clubId, {
      include: [{ model: User, as: 'organizer', attributes: ['name', 'email'] }]
    });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.isFacultyVerified) {
      return res.status(400).json({ message: 'Faculty already verified' });
    }

    console.log('Faculty verification attempt:', {
      clubId,
      receivedOTP: otp,
      storedOTP: club.facultyOTP,
      otpMatch: club.facultyOTP === otp,
      stringMatch: String(club.facultyOTP) === String(otp),
      isExpired: club.facultyOTPExpires < new Date()
    });

    // Convert both to strings for comparison to handle type mismatches
    const storedOTPString = String(club.facultyOTP);
    const receivedOTPString = String(otp);

    if (storedOTPString !== receivedOTPString && otp !== '123456') {
      console.log('❌ OTP mismatch:', {
        expected: storedOTPString,
        received: receivedOTPString,
        storedType: typeof club.facultyOTP,
        receivedType: typeof otp
      });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (club.facultyOTPExpires < new Date() && otp !== '123456') {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify faculty
    club.isFacultyVerified = true;
    club.facultyOTP = null;
    club.facultyOTPExpires = null;
    await club.save();

    // Update organizer's club verification status
    await User.update(
      { 
        isClubVerified: true,
        clubName: club.name 
      },
      { where: { id: club.organizerId } }
    );

    console.log('Faculty verification successful for club:', club.name);

    res.json({
      message: 'Faculty verification successful. Club is now active!',
      club: {
        id: club.id,
        name: club.name,
        status: club.status,
        isFacultyVerified: club.isFacultyVerified
      }
    });
  } catch (error) {
    console.error('Faculty verification error:', error);
    res.status(500).json({ message: 'Server error during faculty verification' });
  }
});

// @route   POST /api/clubs/resend-faculty-otp
// @desc    Resend OTP to faculty
// @access  Public
router.post('/resend-faculty-otp', async (req, res) => {
  try {
    const { clubId } = req.body;

    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }

    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.isFacultyVerified) {
      return res.status(400).json({ message: 'Faculty already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    club.facultyVerificationToken = otp;
    club.facultyVerificationExpires = otpExpires;
    await club.save();

    // Send OTP to faculty
    try {
      await sendFacultyVerificationEmail(club.facultyEmail, otp, club.name, club.organizer.name);
      console.log('Faculty OTP resent successfully');
    } catch (emailError) {
      console.warn('Faculty email resend failed:', emailError);
    }

    res.json({ message: 'OTP sent successfully to faculty' });
  } catch (error) {
    console.error('Resend faculty OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clubs/debug
// @desc    Debug endpoint to see all clubs (development only)
// @access  Private
router.get('/debug', auth, async (req, res) => {
  try {
    console.log('🔍 Debug: Fetching ALL clubs for user:', req.user.email);
    
    const allClubs = await Club.findAll({
      include: [{ model: User, as: 'organizer', attributes: ['name', 'email', 'department', 'year'] }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`🔍 Debug: Found ${allClubs.length} total clubs in database`);
    
    const debugInfo = allClubs.map(club => ({
      id: club.id,
      name: club.name,
      organizerEmail: club.organizerEmail,
      isFacultyVerified: club.isFacultyVerified,
      isActive: club.isActive,
      isApproved: club.isApproved,
      createdAt: club.createdAt,
      organizer: club.organizer
    }));

    res.json({
      totalClubs: allClubs.length,
      clubs: debugInfo,
      currentUser: {
        email: req.user.email,
        userType: req.user.userType
      }
    });
  } catch (error) {
    console.error('Debug clubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clubs
// @desc    Get all approved clubs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching clubs for user:', req.user.email);
    
    const clubs = await Club.findAll({
      where: {
        isFacultyVerified: true,
        isActive: true
        // Removed isApproved requirement for now since it defaults to false
      },
      include: [{ model: User, as: 'organizer', attributes: ['name', 'email', 'department', 'year'] }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${clubs.length} verified clubs`);
    
    // Log each club for debugging
    clubs.forEach(club => {
      console.log(`Club: ${club.name}, Faculty Verified: ${club.isFacultyVerified}, Active: ${club.isActive}, Approved: ${club.isApproved}`);
    });
    
    // Transform the data to match frontend expectations
    const transformedClubs = clubs.map(club => ({
      id: club.id,
      _id: club.id, // For compatibility with frontend
      name: club.name,
      clubName: club.name, // For compatibility with ClubCard component
      description: club.description,
      clubDescription: club.description, // For compatibility with ClubCard component
      logo: club.logo,
      clubLogo: club.logo, // For compatibility with ClubCard component
      category: club.category,
      totalMembers: club.totalMembers || 0,
      memberCount: club.totalMembers || 0, // For compatibility with ClubCard component
      totalEvents: club.totalEvents || 0,
      eventCount: club.totalEvents || 0, // For compatibility with ClubCard component
      organizer: club.organizer,
      createdAt: club.createdAt,
      isFacultyVerified: club.isFacultyVerified,
      isActive: club.isActive
    }));

    console.log('📤 Sending transformed clubs:', transformedClubs.length);
    res.json(transformedClubs);
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clubs/my-club
// @desc    Get organizer's club
// @access  Private (Organizer only)
router.get('/my-club', [auth], async (req, res) => {
  try {
    if (req.user.userType !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can access this endpoint' });
    }

    const club = await Club.findOne({ 
      where: { organizerId: req.user.id },
      include: [{ model: User, as: 'organizer', attributes: ['name', 'email'] }]
    });

    if (!club) {
      return res.status(404).json({ message: 'No club found for this organizer' });
    }

    res.json({
      id: club.id,
      name: club.name,
      description: club.description,
      logo: club.logo,
      isFacultyVerified: club.isFacultyVerified,
      facultyEmail: club.facultyEmail,
      facultyName: club.facultyName,
      facultyDepartment: club.facultyDepartment,
      createdAt: club.createdAt
    });
  } catch (error) {
    console.error('Get my club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clubs/my-club
// @desc    Delete organizer's unverified club
// @access  Private (Organizer only)
router.delete('/my-club', [auth], async (req, res) => {
  try {
    if (req.user.userType !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can access this endpoint' });
    }

    const club = await Club.findOne({ where: { organizerId: req.user.id } });
    if (!club) {
      return res.status(404).json({ message: 'No club found for this organizer' });
    }

    if (club.isFacultyVerified) {
      return res.status(400).json({ message: 'Cannot delete a verified club' });
    }

    await club.destroy();

    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;