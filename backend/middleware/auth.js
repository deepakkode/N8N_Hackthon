const jwt = require('jsonwebtoken');
const { User } = require('../models/mysql');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - received token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded token:', decoded);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      console.log('Auth middleware - user not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('Auth middleware - user found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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