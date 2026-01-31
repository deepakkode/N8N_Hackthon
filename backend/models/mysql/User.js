const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  userType: {
    type: DataTypes.ENUM('student', 'organizer'),
    allowNull: false,
    defaultValue: 'student'
  },
  year: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  college: {
    type: DataTypes.STRING(255),
    defaultValue: 'KL University'
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailOTP: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isClubVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  clubName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  facultyOTP: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  facultyOTPExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  facultyEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Profile fields
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  achievements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  eventsRegistered: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  eventsWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  eventsOrganized: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate OTP
User.prototype.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOTP = otp;
  this.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return otp;
};

// Instance method to generate Faculty OTP
User.prototype.generateFacultyOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.facultyOTP = otp;
  this.facultyOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return otp;
};

module.exports = User;