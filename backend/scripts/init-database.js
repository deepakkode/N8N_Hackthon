const { testConnection, syncDatabase } = require('../config/database');
const { User, Event, Club, EventRegistration } = require('../models/mysql');
const { createTestUsers } = require('./create-test-users');

console.log('🚀 Initializing Vivento Events Database...');

const initializeDatabase = async () => {
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await testConnection();
    
    // Sync database (create tables)
    console.log('📊 Creating database tables...');
    await syncDatabase();
    
    console.log('✅ Database initialized successfully!');
    console.log('');
    console.log('📋 Created tables:');
    console.log('   - users (User accounts)');
    console.log('   - clubs (Student clubs)');
    console.log('   - events (Campus events)');
    console.log('   - event_registrations (Event registrations)');
    console.log('');
    
    // Check if user wants to create test data
    const args = process.argv.slice(2);
    const createTestData = args.includes('--with-test-data') || args.includes('-t');
    
    if (createTestData) {
      console.log('🔄 Creating test users and sample data...');
      await createTestUsers();
      console.log('');
    } else {
      console.log('💡 Tip: To create test users for development, run:');
      console.log('   node scripts/init-database.js --with-test-data');
      console.log('   or use: create-test-users.bat');
      console.log('');
    }
    
    console.log('🎉 Your Vivento Events database is ready!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting steps:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   1. ❌ MySQL server is not running');
      console.log('      → Start MySQL through XAMPP or system services');
      console.log('      → Check if MySQL is running on port 3306');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   1. ❌ Database credentials are incorrect');
      console.log('      → Check DB_USER and DB_PASSWORD in .env file');
      console.log('      → Verify MySQL user has proper permissions');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   1. ❌ Database does not exist');
      console.log('      → Create database: CREATE DATABASE vivento_events;');
      console.log('      → Or update DB_NAME in .env file');
    }
    
    console.log('');
    console.log('📖 For detailed setup instructions, see MYSQL_SETUP.md');
    
    process.exit(1);
  }
};

initializeDatabase();