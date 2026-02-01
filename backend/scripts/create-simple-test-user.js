const { User } = require('../models/mysql');
const { sequelize } = require('../config/database');

const createSimpleTestUser = async () => {
  try {
    console.log('🔄 Creating simple test student user...');

    // Delete existing test user if exists
    await User.destroy({ where: { email: 'student@test.com' } });

    // Create just one test student user
    const testStudent = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123', // Will be hashed by beforeCreate hook
      userType: 'student',
      department: 'Computer Science',
      year: '3',
      section: 'A',
      phone: '9876543210',
      college: 'Test College',
      isEmailVerified: true
    });

    console.log('✅ Test student user created successfully!');
    console.log('\n📋 Test Account:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    STUDENT ACCOUNT                      │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    student@test.com                              │');
    console.log('│ Password: password123                                   │');
    console.log('│ Name:     Test Student                                  │');
    console.log('│ Dept:     Computer Science, Year 3, Section A          │');
    console.log('│ Status:   Email verified, ready to login               │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🚀 You can now login and test student features!');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
};

// Run the script
if (require.main === module) {
  createSimpleTestUser()
    .then(() => {
      console.log('\n✅ Simple test user creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSimpleTestUser };