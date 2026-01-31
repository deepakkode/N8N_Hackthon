const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
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
  logo: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.ENUM('technical', 'cultural', 'sports', 'academic', 'social', 'professional'),
    allowNull: false,
    defaultValue: 'technical'
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Organizer details
  organizerName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  organizerEmail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  organizerPhone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  organizerYear: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  organizerDepartment: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Faculty verification
  facultyName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  facultyEmail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  facultyDepartment: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  facultyOTP: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  facultyOTPExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isFacultyVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  facultyVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Club status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Club statistics
  totalMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // Organizer is the first member
  },
  totalEvents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Additional club information
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 2000,
      max: new Date().getFullYear()
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'clubs',
  indexes: [
    {
      fields: ['organizerId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive', 'isApproved']
    },
    {
      fields: ['facultyEmail']
    }
  ]
});

// Instance method to generate Faculty OTP
Club.prototype.generateFacultyOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.facultyOTP = otp;
  this.facultyOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return otp;
};

// Instance method to verify Faculty OTP
Club.prototype.verifyFacultyOTP = function(inputOTP) {
  if (!this.facultyOTP || !this.facultyOTPExpires) {
    return false;
  }
  
  if (new Date() > this.facultyOTPExpires) {
    return false; // OTP expired
  }
  
  return this.facultyOTP === inputOTP;
};

module.exports = Club;