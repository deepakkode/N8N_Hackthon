const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventReminderEmail } = require('./emailService');

// Function to calculate days between two dates
const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Function to send reminder emails for events
const sendEventReminders = async () => {
  try {
    console.log('Checking for events that need reminder emails...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get events happening in the next 7 days
    const upcomingEvents = await Event.find({
      date: {
        $gte: today,
        $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      isPublished: true,
      isActive: true
    }).populate('registrations.user', 'name email');

    for (const event of upcomingEvents) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      const daysUntilEvent = getDaysDifference(today, eventDate);
      
      // Send reminders for 7 days, 3 days, 1 day, and day of event
      if ([7, 3, 1, 0].includes(daysUntilEvent)) {
        console.log(`Sending ${daysUntilEvent}-day reminders for event: ${event.name}`);
        
        // Get approved registrations
        const approvedRegistrations = event.registrations.filter(
          reg => reg.registrationStatus === 'approved'
        );
        
        for (const registration of approvedRegistrations) {
          try {
            await sendEventReminderEmail(
              registration.user.email,
              registration.user.name,
              event.name,
              daysUntilEvent,
              event.date,
              event.time,
              event.venue
            );
            
            console.log(`Reminder sent to ${registration.user.email} for ${event.name}`);
          } catch (emailError) {
            console.error(`Failed to send reminder to ${registration.user.email}:`, emailError);
          }
        }
      }
    }
    
    console.log('Event reminder check completed');
  } catch (error) {
    console.error('Error in sendEventReminders:', error);
  }
};

// Schedule the reminder check to run daily at 9:00 AM
const scheduleEventReminders = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running scheduled event reminder check...');
    sendEventReminders();
  }, {
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
  
  console.log('Event reminder scheduler initialized - will run daily at 9:00 AM IST');
};

// Function to manually trigger reminder check (for testing)
const triggerReminderCheck = async () => {
  console.log('Manually triggering reminder check...');
  await sendEventReminders();
};

module.exports = {
  scheduleEventReminders,
  triggerReminderCheck,
  sendEventReminders
};