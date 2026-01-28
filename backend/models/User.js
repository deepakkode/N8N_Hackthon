const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['student', 'organizer'],
    required: true
  },
  // Student/Organizer Details
  year: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  // College Info
  college: {
    type: String,
    required: true,
    default: process.env.COLLEGE_NAME || 'KL University'
  },
  // Organizer specific fields
  clubName: {
    type: String,
    trim: true
  },
  clubDescription: {
    type: String,
    trim: true
  },
  isClubVerified: {
    type: Boolean,
    default: false
  },
  // Profile fields
  profilePicture: {
    type: String, // URL or base64 string
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  // Student profile stats
  eventsRegistered: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  eventsWon: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    wonAt: {
      type: Date,
      default: Date.now
    }
  }],
  favoriteClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  // Organizer profile stats
  eventsCreated: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalParticipants: {
    type: Number,
    default: 0
  },
  // Social links
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    }
  },
  // Achievements and badges
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);