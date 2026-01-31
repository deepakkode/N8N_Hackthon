const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, syncDatabase } = require('./config/database');
// const { scheduleEventReminders } = require('./utils/notificationScheduler');

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
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3010',
        'http://localhost:3011'
      ],
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Connect to MySQL and sync database
const initializeDatabase = async () => {
  console.log('🔍 MySQL Configuration:');
  console.log('   Host:', process.env.DB_HOST || 'localhost');
  console.log('   Port:', process.env.DB_PORT || 3306);
  console.log('   Database:', process.env.DB_NAME || 'vivento_events');
  console.log('   User:', process.env.DB_USER || 'root');
  
  await testConnection();
  await syncDatabase();
};

initializeDatabase();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vivento Campus Events API is running!',
    database: 'MySQL',
    version: '2.0.0'
  });
});

const PORT = 5006;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Check email service status
  try {
    const { testTransporter } = require('./utils/emailService');
    const emailWorking = await testTransporter();
    
    if (emailWorking) {
      console.log('📧 Email service: ✅ Ready');
    } else {
      console.log('📧 Email service: ⚠️  Not configured (using bypass OTP: 123456)');
    }
  } catch (error) {
    console.log('📧 Email service: ⚠️  Not configured (using bypass OTP: 123456)');
  }
});