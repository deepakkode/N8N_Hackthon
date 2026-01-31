const express = require('express');
const router = express.Router();
const { User, Event, Club, EventRegistration } = require('../models/mysql');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'emailOTP', 'otpExpires'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's registered events
    const registrations = await EventRegistration.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, as: 'event', attributes: ['name', 'category', 'date'] }]
    });

    // Get user's created events (for organizers)
    let createdEvents = [];
    if (user.userType === 'organizer') {
      createdEvents = await Event.findAll({
        where: { organizerId: req.user.id },
        attributes: ['name', 'category', 'date'],
        include: [{ model: EventRegistration, as: 'registrations' }]
      });
    }

    // Calculate additional stats
    const profileStats = await calculateProfileStats(user, registrations, createdEvents);

    res.json({
      user: {
        ...user.toJSON(),
        eventsRegistered: registrations.map(reg => ({
          eventId: reg.event.id,
          title: reg.event.name,
          category: reg.event.category,
          date: reg.event.date,
          registeredAt: reg.createdAt
        })),
        eventsCreated: createdEvents.map(event => ({
          eventId: event.id,
          title: event.name,
          category: event.category,
          date: event.date,
          attendees: event.registrations.filter(reg => reg.registrationStatus === 'approved').length
        }))
      },
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

    const user = await User.findByPk(req.user.id);
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
    const user = await User.findByPk(req.user.id);
    const event = await Event.findByPk(req.params.eventId);

    if (!user || !event) {
      return res.status(404).json({ message: 'User or event not found' });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      where: {
        userId: req.user.id,
        eventId: req.params.eventId
      }
    });

    if (!existingRegistration) {
      await EventRegistration.create({
        userId: req.user.id,
        eventId: req.params.eventId,
        registrationStatus: 'pending'
      });
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
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the registration to mark as won
    const registration = await EventRegistration.findOne({
      where: {
        userId: req.user.id,
        eventId: req.params.eventId
      }
    });

    if (registration) {
      registration.isWinner = true;
      await registration.save();
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
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const clubId = req.params.clubId;
    const favoriteClubs = user.favoriteClubs || [];
    const isFavorite = favoriteClubs.includes(clubId);

    if (isFavorite) {
      user.favoriteClubs = favoriteClubs.filter(id => id !== clubId);
    } else {
      user.favoriteClubs = [...favoriteClubs, clubId];
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
async function calculateProfileStats(user, registrations = [], createdEvents = []) {
  const stats = {
    totalEventsRegistered: registrations.length,
    totalEventsWon: registrations.filter(reg => reg.isWinner).length,
    totalFavoriteClubs: (user.favoriteClubs || []).length,
    winRate: 0,
    mostActiveMonth: null,
    recentActivity: []
  };

  // Calculate win rate
  if (stats.totalEventsRegistered > 0) {
    stats.winRate = Math.round((stats.totalEventsWon / stats.totalEventsRegistered) * 100);
  }

  // Find most active month
  if (registrations.length > 0) {
    const monthCounts = {};
    registrations.forEach(reg => {
      const month = new Date(reg.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    if (Object.keys(monthCounts).length > 0) {
      stats.mostActiveMonth = Object.keys(monthCounts).reduce((a, b) => 
        monthCounts[a] > monthCounts[b] ? a : b
      );
    }
  }

  // For organizers, calculate additional stats
  if (user.userType === 'organizer') {
    stats.totalEventsCreated = createdEvents.length;
    stats.totalParticipants = createdEvents.reduce((total, event) => {
      return total + (event.registrations ? event.registrations.filter(reg => reg.registrationStatus === 'approved').length : 0);
    }, 0);
    
    // Calculate average participants per event
    if (stats.totalEventsCreated > 0) {
      stats.avgParticipantsPerEvent = Math.round(stats.totalParticipants / stats.totalEventsCreated);
    }
  }

  return stats;
}

module.exports = router;