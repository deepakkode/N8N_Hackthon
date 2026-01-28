const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { scheduleEventReminders } = require('./utils/notificationScheduler');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        'https://vivento-campus-events.netlify.app',
        'https://creative-scone-3fca73.netlify.app'
      ]
    : ['http://localhost:3000', 'http://localhost:3010'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('CORS Configuration:', {
  environment: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  allowedOrigins: corsOptions.origin
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/profile', require('./routes/profile'));

// Test route for triggering reminder emails (development only)
if (process.env.NODE_ENV !== 'production') {
  const { triggerReminderCheck } = require('./utils/notificationScheduler');
  app.post('/api/test/reminders', async (req, res) => {
    try {
      await triggerReminderCheck();
      res.json({ message: 'Reminder check triggered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error triggering reminders', error: error.message });
    }
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize notification scheduler after DB connection
    scheduleEventReminders();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'College Events API is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});