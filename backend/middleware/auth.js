const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // TEMPORARY: Check if MongoDB is available
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('🚨 MongoDB not connected - using temporary user data in auth middleware');
      
      // Temporary test users for UI testing
      const testUsers = {
        '507f1f77bcf86cd799439011': {
          _id: '507f1f77bcf86cd799439011',
          name: 'Test Student',
          email: 'test@klu.ac.in',
          userType: 'student',
          year: '3rd Year',
          department: 'Computer Science',
          section: 'A',
          college: 'KL University',
          isEmailVerified: true,
          isClubVerified: false,
          clubName: null
        },
        '507f1f77bcf86cd799439012': {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Organizer',
          email: '99240041367@klu.ac.in',
          userType: 'organizer',
          year: '4th Year',
          department: 'Computer Science',
          section: 'B',
          college: 'KL University',
          isEmailVerified: true,
          isClubVerified: true,
          clubName: 'Tech Club'
        },
        '507f1f77bcf86cd799439013': {
          _id: '507f1f77bcf86cd799439013',
          name: 'Ananya Cherukuri',
          email: '99240041365@klu.ac.in',
          userType: 'organizer',
          year: '4th Year',
          department: 'Computer Science',
          section: 'A',
          college: 'KL University',
          isEmailVerified: true,
          isClubVerified: true,
          clubName: 'Innovation Club'
        }
      };

      const testUser = testUsers[decoded.userId];
      if (!testUser) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = testUser;
      req.user.userId = decoded.userId; // Add userId for compatibility
      next();
      return;
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Organizer middleware
const organizerAuth = (req, res, next) => {
  console.log('Organizer auth check:', {
    userType: req.user?.userType,
    isClubVerified: req.user?.isClubVerified,
    email: req.user?.email,
    environment: process.env.NODE_ENV
  });

  if (req.user.userType !== 'organizer') {
    console.log('Access denied: Not an organizer');
    return res.status(403).json({ message: 'Access denied. Organizer account required.' });
  }

  // In development, allow organizers without club verification for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Allowing organizer without club verification');
    next();
    return;
  }

  if (!req.user.isClubVerified) {
    console.log('Access denied: Club not verified');
    return res.status(403).json({ message: 'Access denied. Verified club required.' });
  }

  console.log('Organizer auth passed');
  next();
};

module.exports = { auth, organizerAuth };