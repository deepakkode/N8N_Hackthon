const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Registration form data
  formData: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  // Registration status
  registrationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statusUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  statusUpdatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Payment information
  paymentRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'verified', 'failed'),
    defaultValue: 'pending'
  },
  paymentScreenshot: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentVerifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Additional information
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Event participation tracking
  attended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attendedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Results and achievements
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  certificate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'event_registrations',
  indexes: [
    {
      fields: ['eventId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['registrationStatus']
    },
    {
      fields: ['paymentStatus']
    },
    {
      unique: true,
      fields: ['eventId', 'userId'] // Prevent duplicate registrations
    }
  ]
});

module.exports = EventRegistration;