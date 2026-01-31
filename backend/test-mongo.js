const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB connection...');
console.log('🔍 MongoDB URI (first 50 chars):', process.env.MONGODB_URI?.substring(0, 50) + '...');

const testConnection = async () => {
  try {
    console.log('🚀 Attempting to connect...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('🏛️ Database name:', mongoose.connection.name);
    console.log('🌐 Connection host:', mongoose.connection.host);
    console.log('📊 Connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error code:', error.code);
    console.error('🔍 Error name:', error.name);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🚨 Connection refused - possible causes:');
      console.log('   1. MongoDB Atlas cluster is paused or stopped');
      console.log('   2. Network firewall blocking connection');
      console.log('   3. Incorrect cluster hostname');
      console.log('   4. MongoDB Atlas service outage');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('🚨 Authentication failed - possible causes:');
      console.log('   1. Incorrect username or password');
      console.log('   2. User not authorized for this database');
      console.log('   3. Database name incorrect');
    }
    
    process.exit(1);
  }
};

testConnection();