const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    email: req.user?.email
  });

  if (req.user.userType !== 'organizer') {
    console.log('Access denied: Not an organizer');
    return res.status(403).json({ message: 'Access denied. Organizer account required.' });
  }

  if (!req.user.isClubVerified) {
    console.log('Access denied: Club not verified');
    return res.status(403).json({ message: 'Access denied. Verified club required.' });
  }

  console.log('Organizer auth passed');
  next();
};

module.exports = { auth, organizerAuth };