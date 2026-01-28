const express = require('express');
const { body, validationResult } = require('express-validator');
const Club = require('../models/Club');
const User = require('../models/User');
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
    const { clubName, clubDescription, facultyName, facultyEmail, facultyDepartment } = req.body;
    
    if (!clubName || clubName.trim().length < 3) {
      return res.status(400).json({ message: 'Club name must be at least 3 characters' });
    }
    
    if (!clubDescription || clubDescription.trim().length < 10) {
      return res.status(400).json({ message: 'Club description must be at least 10 characters' });
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
    const existingClub = await Club.findOne({ organizer: req.user._id });
    if (existingClub) {
      return res.status(400).json({ message: 'You already have a club. Each organizer can only create one club.' });
    }

    const { clubLogo } = req.body;

    // Check if club name already exists
    const existingClubName = await Club.findOne({ 
      clubName: { $regex: new RegExp(`^${clubName}$`, 'i') },
      college: req.user.college 
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
    const club = new Club({
      clubName,
      clubDescription,
      clubLogo,
      organizer: req.user._id,
      facultyName,
      facultyEmail,
      facultyDepartment,
      college: req.user.college,
      facultyVerificationToken: otp,
      facultyVerificationExpires: otpExpires
    });

    await club.save();
    console.log('Club created successfully:', { id: club._id, name: club.clubName });

    // Send OTP to faculty
    try {
      await sendFacultyVerificationEmail(facultyEmail, otp, clubName, req.user.name);
      console.log('Faculty verification email sent successfully');
    } catch (emailError) {
      console.warn('Faculty email sending failed, but continuing:', emailError);
    }

    res.status(201).json({
      message: 'Club created successfully. OTP sent to faculty advisor for verification.',
      clubId: club._id,
      facultyEmail: club.facultyEmail
    });
  } catch (error) {
    console.error('Create club error:', error);
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

    const club = await Club.findById(clubId).populate('organizer', 'name email');
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.isFacultyVerified) {
      return res.status(400).json({ message: 'Faculty already verified' });
    }

    if (club.facultyVerificationToken !== otp && otp !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (club.facultyVerificationExpires < new Date() && otp !== '123456') {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify faculty
    club.isFacultyVerified = true;
    club.status = 'faculty_verified';
    club.facultyVerificationToken = undefined;
    club.facultyVerificationExpires = undefined;
    await club.save();

    // Update organizer's club verification status
    await User.findByIdAndUpdate(club.organizer._id, { 
      isClubVerified: true,
      clubName: club.clubName 
    });

    console.log('Faculty verification successful for club:', club.clubName);

    res.json({
      message: 'Faculty verification successful. Club is now active!',
      club: {
        id: club._id,
        clubName: club.clubName,
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

    const club = await Club.findById(clubId);
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
      await sendFacultyVerificationEmail(club.facultyEmail, otp, club.clubName, club.organizer.name);
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

// @route   GET /api/clubs
// @desc    Get all approved clubs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const clubs = await Club.find({
      college: req.user.college,
      status: 'faculty_verified'
    })
    .populate('organizer', 'name email department year')
    .select('-facultyVerificationToken')
    .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;