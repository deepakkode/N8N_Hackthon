const mongoose = require('mongoose');

const registrationFieldSchema = new mongoose.Schema({
  id: Number,
  type: {
    type: String,
    enum: ['text', 'email', 'tel', 'number', 'select', 'radio', 'checkbox', 'textarea', 'file', 'date'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: String,
  options: [String] // For select, radio, checkbox fields
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  poster: {
    type: String, // URL or base64 string
    required: false // Make poster optional for now
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'competition']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  
  // Registration Form
  registrationForm: {
    fields: [registrationFieldSchema]
  },
  
  // Payment Details
  paymentRequired: {
    type: Boolean,
    default: false
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentQR: {
    type: String, // URL or base64 string
    default: null
  },
  paymentInstructions: {
    type: String,
    default: ''
  },
  
  // Organizer Info
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  
  // Event Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Registration tracking
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    formData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    paymentScreenshot: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1, category: 1, collegeName: 1, isPublished: 1 });
eventSchema.index({ organizer: 1, club: 1 });

// Virtual for approved registrations count
eventSchema.virtual('approvedRegistrationsCount').get(function() {
  return this.registrations.filter(reg => reg.registrationStatus === 'approved').length;
});

// Virtual for pending registrations count
eventSchema.virtual('pendingRegistrationsCount').get(function() {
  return this.registrations.filter(reg => reg.registrationStatus === 'pending').length;
});

module.exports = mongoose.model('Event', eventSchema);