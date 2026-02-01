const express = require('express');
const { body, validationResult } = require('express-validator');
const { Event, User, Club, EventRegistration } = require('../models/mysql');
const { auth, organizerAuth } = require('../middleware/auth');
const { sendApplicationStatusEmail } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/events/debug
// @desc    Get all events (including unpublished) for debugging
// @access  Private
router.get('/debug', auth, async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log(`Found ${events.length} events in database`);
    events.forEach(event => {
      console.log(`Event: ${event.name}, Published: ${event.isPublished}, Active: ${event.isActive}`);
    });

    res.json(events);
  } catch (error) {
    console.error('Debug events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/clear-all
// @desc    Clear all events (development only)
// @access  Public (development only)
router.delete('/clear-all', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }

    const deletedCount = await Event.destroy({ where: {} });
    console.log(`🗑️ Cleared ${deletedCount} events from database`);
    
    res.json({ 
      message: `Successfully cleared ${deletedCount} events`,
      deletedCount: deletedCount
    });
  } catch (error) {
    console.error('Clear events error:', error);
    res.status(500).json({ message: 'Server error clearing events' });
  }
});

// @route   GET /api/events
// @desc    Get all published events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching events for user:', req.user.email);
    
    const events = await Event.findAll({
      where: { 
        isPublished: true, 
        isActive: true 
      },
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['name'] },
        { 
          model: EventRegistration, 
          as: 'registrations',
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        }
      ],
      order: [['date', 'ASC']]
    });

    console.log(`📊 Found ${events.length} events`);

    // Add user's registration status to each event
    const eventsWithUserInfo = events.map(event => {
      const userRegistration = event.registrations.find(
        reg => reg.userId === req.user.id
      );
      
      return {
        ...event.toJSON(),
        userRegistration: userRegistration ? {
          registrationStatus: userRegistration.registrationStatus,
          registeredAt: userRegistration.createdAt
        } : null
      };
    });

    console.log('✅ Events processed successfully, sending response');
    res.json(eventsWithUserInfo);
  } catch (error) {
    console.error('❌ Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/my-events
// @desc    Get user's registered/applied events
// @access  Private
router.get('/my-events', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Event,
        as: 'event',
        include: [
          { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
          { model: Club, as: 'club', attributes: ['name'] }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    // Format the response to include user registration info
    const eventsWithUserInfo = registrations.map(registration => ({
      ...registration.event.toJSON(),
      userRegistration: {
        registrationStatus: registration.registrationStatus,
        registeredAt: registration.createdAt,
        paymentStatus: registration.paymentStatus,
        formData: registration.formData
      }
    }));

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
    const events = await Event.findAll({
      where: { organizerId: req.user.id },
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['name'] },
        { 
          model: EventRegistration, 
          as: 'registrations',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        }
      ],
      order: [['date', 'DESC']]
    });

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
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['name'] },
        { 
          model: EventRegistration, 
          as: 'registrations',
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    const userRegistration = event.registrations.find(
      reg => reg.userId === req.user.id
    );

    res.json({
      ...event.toJSON(),
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

    // Find user's club (allow testing without verified club)
    console.log('Looking for user club...');
    let club = await Club.findOne({ 
      where: { 
        organizerId: req.user.id, 
        isFacultyVerified: true 
      } 
    });
    console.log('Club found:', club ? { id: club.id, name: club.name, verified: club.isFacultyVerified } : 'No club found');
    
    // For testing purposes, create a default club if none exists
    if (!club) {
      console.log('No verified club found, creating/finding default club for testing');
      club = await Club.findOne({ where: { name: 'Default Test Club' } });
      
      if (!club) {
        club = await Club.create({
          name: 'Default Test Club',
          description: 'Default club for testing purposes',
          organizerId: req.user.id,
          facultyName: 'Test Faculty',
          facultyEmail: 'faculty@test.com',
          facultyDepartment: 'Computer Science',
          college: req.user.college,
          isVerified: true,
          isFacultyVerified: true
        });
        console.log('Default test club created');
      }
    }

    const event = await Event.create({
      name,
      description,
      poster: poster && typeof poster === 'string' ? poster : null,
      venue,
      collegeName,
      category,
      date,
      time,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      organizerId: req.user.id,
      clubId: club.id,
      isPublished: false // Will be published after form setup
    });

    console.log('Creating event with data:', {
      name: event.name,
      description: event.description.substring(0, 50) + '...',
      poster: event.poster ? 'Present' : 'Not provided',
      venue: event.venue,
      category: event.category,
      date: event.date,
      time: event.time,
      organizerId: event.organizerId,
      clubId: event.clubId,
      isPublished: event.isPublished
    });

    console.log('Event saved successfully with ID:', event.id);

    // Load the event with associations
    const eventWithAssociations = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Club, as: 'club', attributes: ['name'] }
      ]
    });

    console.log('Event created successfully:', { id: event.id, name: event.name });

    res.status(201).json({
      message: 'Event created successfully',
      event: eventWithAssociations
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
    
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
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
    
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    event.paymentRequired = paymentRequired;
    event.paymentAmount = paymentAmount;
    event.paymentQR = paymentQR;
    event.paymentInstructions = paymentInstructions;
    event.isPublished = true; // Publish event after payment setup

    console.log('Publishing event:', {
      id: event.id,
      name: event.name,
      paymentRequired: event.paymentRequired,
      isPublished: event.isPublished
    });

    await event.save();
    console.log('Event published successfully!');

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
    
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: EventRegistration, as: 'registrations' }]
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isPublished || !event.isActive) {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if user is the organizer of this event
    if (event.organizerId === req.user.id) {
      return res.status(400).json({ message: 'Organizers cannot register for their own events' });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      where: { 
        eventId: req.params.id,
        userId: req.user.id 
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const approvedCount = await EventRegistration.count({
      where: { 
        eventId: req.params.id,
        registrationStatus: 'approved' 
      }
    });

    if (event.maxParticipants && approvedCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Create registration
    await EventRegistration.create({
      eventId: req.params.id,
      userId: req.user.id,
      formData: formData || {},
      paymentScreenshot,
      paymentStatus: paymentScreenshot ? 'pending' : 'verified',
      registrationStatus: 'pending'
    });

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
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const registrations = await EventRegistration.findAll({
      where: { eventId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:eventId/applications/:applicationId
// @desc    Update application status
// @access  Private (Organizer only)
router.put('/:eventId/applications/:applicationId', [auth, organizerAuth], async (req, res) => {
  try {
    const { registrationStatus, paymentStatus } = req.body;
    
    const event = await Event.findByPk(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const registration = await EventRegistration.findByPk(req.params.applicationId, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    
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

    await registration.save();

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

// @route   PUT /api/events/:eventId/attendance/:registrationId
// @desc    Mark/unmark attendance for a registration
// @access  Private (Organizer only)
router.put('/:eventId/attendance/:registrationId', [auth, organizerAuth], async (req, res) => {
  try {
    const { attended, attendedAt } = req.body;
    
    const event = await Event.findByPk(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const registration = await EventRegistration.findByPk(req.params.registrationId, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update attendance
    registration.attended = attended;
    registration.attendedAt = attended ? (attendedAt || new Date()) : null;
    await registration.save();

    console.log(`✅ Attendance ${attended ? 'marked' : 'removed'} for ${registration.user?.name}`);

    res.json({ 
      message: `Attendance ${attended ? 'marked' : 'removed'} successfully`,
      registration: {
        id: registration.id,
        attended: registration.attended,
        attendedAt: registration.attendedAt
      }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:eventId/scan-qr
// @desc    Process QR code scan for attendance
// @access  Private (Organizer only)
router.post('/:eventId/scan-qr', [auth, organizerAuth], async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR code data
    let qrInfo;
    try {
      qrInfo = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { eventId, userId, registrationId, timestamp } = qrInfo;
    
    // Verify QR code is for this event
    if (parseInt(eventId) !== parseInt(req.params.eventId)) {
      return res.status(400).json({ message: 'QR code is not for this event' });
    }

    const event = await Event.findByPk(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the registration
    const registration = await EventRegistration.findOne({
      where: { 
        id: registrationId,
        eventId: req.params.eventId,
        userId: userId
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found or invalid QR code' });
    }

    // Check if already attended
    if (registration.attended) {
      return res.status(400).json({ 
        message: 'Student already marked present',
        studentName: registration.user?.name
      });
    }

    // Check if registration is approved
    if (registration.registrationStatus !== 'approved') {
      return res.status(400).json({ 
        message: 'Registration is not approved',
        studentName: registration.user?.name,
        status: registration.registrationStatus
      });
    }

    // Mark attendance
    registration.attended = true;
    registration.attendedAt = new Date();
    await registration.save();

    console.log(`✅ QR Scan: Attendance marked for ${registration.user?.name}`);

    res.json({ 
      message: 'Attendance marked successfully',
      studentName: registration.user?.name,
      attendedAt: registration.attendedAt,
      registration: {
        id: registration.id,
        attended: registration.attended,
        attendedAt: registration.attendedAt
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Server error processing QR code' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Organizer only)
router.delete('/:id', [auth, organizerAuth], async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;