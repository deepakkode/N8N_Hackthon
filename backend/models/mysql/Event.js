const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  poster: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      // Remove notEmpty validation since poster is optional
    }
  },
  venue: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  collegeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'KL University'
  },
  category: {
    type: DataTypes.ENUM('technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'competition'),
    allowNull: false,
    defaultValue: 'technical'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0] // Must be today or future
    }
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 1,
      max: 10000
    }
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Registration form configuration
  registrationForm: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      fields: [
        { id: 1, type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { id: 2, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
        { id: 3, type: 'tel', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' }
      ]
    }
  },
  // Payment configuration
  paymentRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  paymentQR: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Event statistics
  totalRegistrations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  approvedRegistrations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Event status tracking
  eventStatus: {
    type: DataTypes.ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'draft'
  }
}, {
  tableName: 'events',
  indexes: [
    {
      fields: ['organizerId']
    },
    {
      fields: ['clubId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isPublished', 'isActive']
    }
  ]
});

module.exports = Event;