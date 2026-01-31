const { testConnection, syncDatabase } = require('./config/database');
const { User, Event, Club, EventRegistration } = require('./models/mysql');

console.log('🔍 Testing MySQL connection and models...');

const testMySQL = async () => {
  try {
    // Test connection
    console.log('🚀 Testing database connection...');
    await testConnection();
    
    // Sync database (create tables)
    console.log('📊 Syncing database tables...');
    await syncDatabase();
    
    // Test creating a user
    console.log('👤 Testing user creation...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@klu.ac.in',
      password: '123456',
      userType: 'student',
      year: '3rd Year',
      department: 'Computer Science',
      section: 'A',
      college: 'KL University'
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email
    });
    
    // Test password comparison
    const isPasswordValid = await testUser.comparePassword('123456');
    console.log('🔐 Password validation test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Clean up test data
    await testUser.destroy();
    console.log('🗑️ Test user cleaned up');
    
    console.log('🎉 All MySQL tests passed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MySQL test failed:', error.message);
    console.error('🔍 Error details:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🚨 Access denied - possible causes:');
      console.log('   1. Incorrect MySQL username or password');
      console.log('   2. User does not have permission to access the database');
      console.log('   3. MySQL server authentication settings');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 Connection refused - possible causes:');
      console.log('   1. MySQL server is not running');
      console.log('   2. Incorrect host or port');
      console.log('   3. Firewall blocking connection');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🚨 Database does not exist - possible causes:');
      console.log('   1. Database name is incorrect');
      console.log('   2. Database has not been created yet');
      console.log('   3. User does not have access to the database');
    }
    
    process.exit(1);
  }
};

testMySQL();