const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
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
    : ['http://localhost:3000', 'http://localhost:3010', 'http://localhost:3011'],
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

// Connect to MongoDB with better error handling and fallback
console.log('🔍 MongoDB URI from env:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('🔍 MongoDB URI (first 50 chars):', process.env.MONGODB_URI?.substring(0, 50) + '...');

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log('🏛️ Connected to:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔍 Attempted URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    // Provide helpful error messages
    if (err.message.includes('ECONNREFUSED')) {
      console.log('🚨 Connection refused - possible causes:');
      console.log('   1. MongoDB Atlas cluster is paused or stopped');
      console.log('   2. Network firewall blocking connection');
      console.log('   3. Incorrect cluster hostname');
      console.log('   4. MongoDB Atlas service outage');
      console.log('   5. Try getting a fresh connection string from Atlas dashboard');
    }
    
    if (err.message.includes('ETIMEOUT')) {
      console.log('🚨 DNS/Network timeout - possible causes:');
      console.log('   1. Network firewall blocking MongoDB Atlas');
      console.log('   2. DNS server cannot resolve MongoDB Atlas hostnames');
      console.log('   3. Corporate network restrictions');
      console.log('   4. Try using a VPN or different network');
    }
    
    // Don't exit the server, just log the error
    console.log('⚠️ Server will continue running but database operations will fail');
    console.log('💡 Please check your MongoDB Atlas cluster status and connection string');
  }
};

connectToMongoDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'College Events API is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
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