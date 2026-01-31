const { sequelize } = require('../../config/database');
const User = require('./User');
const Event = require('./Event');
const Club = require('./Club');
const EventRegistration = require('./EventRegistration');

// Define associations
// User associations
User.hasMany(Event, { 
  foreignKey: 'organizerId', 
  as: 'organizedEvents',
  onDelete: 'CASCADE'
});

User.hasMany(Club, { 
  foreignKey: 'organizerId', 
  as: 'ownedClubs',
  onDelete: 'CASCADE'
});

User.hasMany(EventRegistration, { 
  foreignKey: 'userId', 
  as: 'eventRegistrations',
  onDelete: 'CASCADE'
});

// Event associations
Event.belongsTo(User, { 
  foreignKey: 'organizerId', 
  as: 'organizer'
});

Event.belongsTo(Club, { 
  foreignKey: 'clubId', 
  as: 'club'
});

Event.hasMany(EventRegistration, { 
  foreignKey: 'eventId', 
  as: 'registrations',
  onDelete: 'CASCADE'
});

// Club associations
Club.belongsTo(User, { 
  foreignKey: 'organizerId', 
  as: 'organizer'
});

Club.hasMany(Event, { 
  foreignKey: 'clubId', 
  as: 'events',
  onDelete: 'SET NULL'
});

// EventRegistration associations
EventRegistration.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

EventRegistration.belongsTo(Event, { 
  foreignKey: 'eventId', 
  as: 'event'
});

EventRegistration.belongsTo(User, { 
  foreignKey: 'statusUpdatedBy', 
  as: 'statusUpdater'
});

EventRegistration.belongsTo(User, { 
  foreignKey: 'paymentVerifiedBy', 
  as: 'paymentVerifier'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Event,
  Club,
  EventRegistration
};