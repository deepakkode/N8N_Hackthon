const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Club = require('../models/Club');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('eventsRegistered.eventId', 'title category date')
      .populate('eventsWon.eventId', 'title category date')
      .populate('favoriteClubs', 'name description logo')
      .populate('eventsCreated.eventId', 'title category date attendees')
      .select('-password -emailVerificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate additional stats
    const profileStats = await calculateProfileStats(user);

    res.json({
      user,
      stats: profileStats
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const {
      bio,
      profilePicture,
      socialLinks
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add event to user's registered events
router.post('/register-event/:eventId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const event = await Event.findById(req.params.eventId);

    if (!user || !event) {
      return res.status(404).json({ message: 'User or event not found' });
    }

    // Check if already registered
    const alreadyRegistered = user.eventsRegistered.some(
      reg => reg.eventId.toString() === req.params.eventId
    );

    if (!alreadyRegistered) {
      user.eventsRegistered.push({
        eventId: req.params.eventId,
        registeredAt: new Date()
      });
      await user.save();
    }

    res.json({ message: 'Event registered successfully' });
  } catch (error) {
    console.error('Error registering event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark event as won
router.post('/win-event/:eventId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already marked as won
    const alreadyWon = user.eventsWon.some(
      win => win.eventId.toString() === req.params.eventId
    );

    if (!alreadyWon) {
      user.eventsWon.push({
        eventId: req.params.eventId,
        wonAt: new Date()
      });

      // Add achievement for first win
      if (user.eventsWon.length === 1) {
        user.achievements.push({
          title: 'First Victory',
          description: 'Won your first event!',
          icon: '🏆'
        });
      }

      await user.save();
    }

    res.json({ message: 'Event marked as won' });
  } catch (error) {
    console.error('Error marking event as won:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add club to favorites
router.post('/favorite-club/:clubId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const clubId = req.params.clubId;
    const isFavorite = user.favoriteClubs.includes(clubId);

    if (isFavorite) {
      user.favoriteClubs = user.favoriteClubs.filter(id => id.toString() !== clubId);
    } else {
      user.favoriteClubs.push(clubId);
    }

    await user.save();

    res.json({ 
      message: isFavorite ? 'Club removed from favorites' : 'Club added to favorites',
      isFavorite: !isFavorite
    });
  } catch (error) {
    console.error('Error updating favorite clubs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile statistics
async function calculateProfileStats(user) {
  const stats = {
    totalEventsRegistered: user.eventsRegistered.length,
    totalEventsWon: user.eventsWon.length,
    totalFavoriteClubs: user.favoriteClubs.length,
    winRate: 0,
    mostActiveMonth: null,
    recentActivity: []
  };

  // Calculate win rate
  if (stats.totalEventsRegistered > 0) {
    stats.winRate = Math.round((stats.totalEventsWon / stats.totalEventsRegistered) * 100);
  }

  // Find most active month
  if (user.eventsRegistered.length > 0) {
    const monthCounts = {};
    user.eventsRegistered.forEach(reg => {
      const month = new Date(reg.registeredAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    stats.mostActiveMonth = Object.keys(monthCounts).reduce((a, b) => 
      monthCounts[a] > monthCounts[b] ? a : b
    );
  }

  // For organizers, calculate additional stats
  if (user.userType === 'organizer') {
    stats.totalEventsCreated = user.eventsCreated.length;
    stats.totalParticipants = user.totalParticipants;
    
    // Calculate average participants per event
    if (stats.totalEventsCreated > 0) {
      stats.avgParticipantsPerEvent = Math.round(stats.totalParticipants / stats.totalEventsCreated);
    }
  }

  return stats;
}

module.exports = router;