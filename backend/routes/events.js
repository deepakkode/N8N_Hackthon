const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const Club = require('../models/Club');
const { auth, organizerAuth } = require('../middleware/auth');
const { sendApplicationStatusEmail } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all published events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, college, search } = req.query;
    let filter = { isPublished: true, isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (college && college !== 'all') {
      filter.collegeName = college;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .populate('club', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/my-events
// @desc    Get user's registered/applied events
// @access  Private
router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'registrations.user': req.user._id
    })
    .populate('organizer', 'name email')
    .populate('club', 'name')
    .sort({ date: 1 });

    // Add user's registration info to each event
    const eventsWithUserInfo = events.map(event => {
      const userRegistration = event.registrations.find(
        reg => reg.user.toString() === req.user._id.toString()
      );
      
      return {
        ...event.toObject(),
        userRegistration: userRegistration || null
      };
    });

    res.json(eventsWithUserInfo);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/organizer/my-events
// @desc    Get organizer's created events
// @access  Private (Organizer only)
router.get('/organizer/my-events', [auth, organizerAuth], async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id
    })
    .populate('organizer', 'name email')
    .populate('club', 'name')
    .populate('registrations.user', 'name email')
    .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with registration form
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('club', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    const userRegistration = event.registrations.find(
      reg => reg.user.toString() === req.user._id.toString()
    );

    res.json({
      ...event.toObject(),
      userRegistration: userRegistration || null,
      isRegistered: !!userRegistration
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event (Step 1: Basic Details)
// @access  Private (Organizer only)
router.post('/', [auth, organizerAuth], async (req, res) => {
  try {
    console.log('Event creation attempt:', {
      user: req.user?.email,
      userType: req.user?.userType,
      body: req.body
    });

    const { 
      name, 
      description, 
      poster, 
      venue, 
      collegeName, 
      category, 
      date, 
      time, 
      maxParticipants 
    } = req.body;

    // Basic validation
    if (!name || name.trim().length < 3) {
      console.log('Validation error: Event name too short');
      return res.status(400).json({ message: 'Event name must be at least 3 characters' });
    }

    if (!description || description.trim().length < 10) {
      console.log('Validation error: Description too short');
      return res.status(400).json({ message: 'Event description must be at least 10 characters' });
    }

    if (!venue || venue.trim().length < 2) {
      console.log('Validation error: Venue required');
      return res.status(400).json({ message: 'Venue is required' });
    }

    if (!collegeName || collegeName.trim().length < 2) {
      console.log('Validation error: College name required');
      return res.status(400).json({ message: 'College name is required' });
    }

    if (!category) {
      console.log('Validation error: Category required');
      return res.status(400).json({ message: 'Category is required' });
    }

    if (!date) {
      console.log('Validation error: Date required');
      return res.status(400).json({ message: 'Event date is required' });
    }

    if (!time) {
      console.log('Validation error: Time required');
      return res.status(400).json({ message: 'Event time is required' });
    }

    // Find user's club
    console.log('Looking for user club...');
    const club = await Club.findOne({ organizer: req.user._id, isFacultyVerified: true });
    console.log('Club found:', club ? { id: club._id, name: club.clubName, verified: club.isFacultyVerified } : 'No club found');
    
    if (!club) {
      return res.status(400).json({ message: 'You must have a verified club to create events' });
    }

    const event = new Event({
      name,
      description,
      poster,
      venue,
      collegeName,
      category,
      date,
      time,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      organizer: req.user._id,
      club: club._id,
      isPublished: false // Will be published after form setup
    });

    await event.save();
    await event.populate('organizer', 'name email');
    await event.populate('club', 'name');

    console.log('Event created successfully:', { id: event._id, name: event.name });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error during event creation' });
  }
});

// @route   PUT /api/events/:id/form
// @desc    Update event registration form (Step 2)
// @access  Private (Organizer only)
router.put('/:id/form', [auth, organizerAuth], async (req, res) => {
  try {
    const { registrationForm } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    event.registrationForm = registrationForm;
    await event.save();

    res.json({
      message: 'Registration form updated successfully',
      event
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/payment
// @desc    Update event payment details (Step 3)
// @access  Private (Organizer only)
router.put('/:id/payment', [auth, organizerAuth], async (req, res) => {
  try {
    const { paymentRequired, paymentAmount, paymentQR, paymentInstructions } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    event.paymentRequired = paymentRequired;
    event.paymentAmount = paymentAmount;
    event.paymentQR = paymentQR;
    event.paymentInstructions = paymentInstructions;
    event.isPublished = true; // Publish event after payment setup

    await event.save();

    res.json({
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for event with custom form data
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const { formData, paymentScreenshot } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isPublished || !event.isActive) {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if already registered
    const existingRegistration = event.registrations.find(
      reg => reg.user.toString() === req.user._id.toString()
    );

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.maxParticipants && event.approvedRegistrationsCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Add registration
    event.registrations.push({
      user: req.user._id,
      formData: new Map(Object.entries(formData)),
      paymentScreenshot,
      paymentStatus: paymentScreenshot ? 'pending' : 'verified',
      registrationStatus: 'pending'
    });

    await event.save();

    res.json({ message: 'Successfully applied for event. Awaiting organizer approval.' });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id/applications
// @desc    Get event applications (for organizers)
// @access  Private (Organizer only)
router.get('/:id/applications', [auth, organizerAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.user', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(event.registrations);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:eventId/applications/:applicationId
// @desc    Update application status
// @access  Private (Organizer only)
router.put('/:eventId/applications/:applicationId', [auth, organizerAuth], async (req, res) => {
  try {
    const { registrationStatus, paymentStatus } = req.body;
    
    const event = await Event.findById(req.params.eventId)
      .populate('registrations.user', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const registration = event.registrations.id(req.params.applicationId);
    if (!registration) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const oldStatus = registration.registrationStatus;

    // Update status
    if (registrationStatus !== undefined) {
      registration.registrationStatus = registrationStatus;
    }
    if (paymentStatus !== undefined) {
      registration.paymentStatus = paymentStatus;
    }

    await event.save();

    // Send email notification if registration status changed
    if (registrationStatus && registrationStatus !== oldStatus) {
      try {
        await sendApplicationStatusEmail(
          registration.user.email,
          registration.user.name,
          event.name,
          registrationStatus,
          event.date,
          event.venue
        );
      } catch (emailError) {
        console.error('Error sending status email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({ 
      message: `Application ${registrationStatus || 'updated'} successfully${registrationStatus ? ' and notification sent' : ''}`,
      registration 
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Organizer only)
router.delete('/:id', [auth, organizerAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;