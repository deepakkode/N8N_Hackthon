const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  // Club Basic Info
  clubName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  clubDescription: {
    type: String,
    required: true,
    trim: true
  },
  clubLogo: {
    type: String, // URL or base64 string
    required: true // Make logo mandatory
  },
  
  // Organizer Info
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Faculty Advisor Info
  facultyName: {
    type: String,
    required: true,
    trim: true
  },
  facultyEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  facultyDepartment: {
    type: String,
    required: true,
    trim: true
  },
  
  // Verification Status
  isOrganizerVerified: {
    type: Boolean,
    default: true // Already verified during user registration
  },
  isFacultyVerified: {
    type: Boolean,
    default: false
  },
  isClubApproved: {
    type: Boolean,
    default: false
  },
  
  // Faculty Verification
  facultyVerificationToken: {
    type: String
  },
  facultyVerificationExpires: {
    type: Date
  },
  
  // College Info
  college: {
    type: String,
    required: true
  },
  
  // Club Stats
  memberCount: {
    type: Number,
    default: 0
  },
  eventCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'faculty_verified', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
clubSchema.index({ college: 1, status: 1 });
clubSchema.index({ organizer: 1 });

module.exports = mongoose.model('Club', clubSchema);