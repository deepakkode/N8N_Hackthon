const { User, Club, Event, EventRegistration } = require('../models/mysql');
const { sequelize } = require('../config/database');

const createTestUsers = async () => {
  try {
    console.log('🔄 Creating test users...');

    // Delete existing test users first to ensure clean creation
    await User.destroy({ where: { email: 'student@test.com' } });
    await User.destroy({ where: { email: 'organizer@test.com' } });
    await User.destroy({ where: { email: 'student2@test.com' } });

    // Create test student user
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

    // Create test organizer user
    const testOrganizer = await User.create({
      name: 'Test Organizer',
      email: 'organizer@test.com',
      password: 'password123', // Will be hashed by beforeCreate hook
      userType: 'organizer',
      department: 'Computer Science',
      year: 'Faculty', // Required field
      section: 'N/A', // Required field
      phone: '9876543211',
      college: 'Test College',
      isEmailVerified: true,
      isClubVerified: true
    });

    // Create another test student
    const testStudent2 = await User.create({
      name: 'Alice Johnson',
      email: 'student2@test.com',
      password: 'password123', // Will be hashed by beforeCreate hook
      userType: 'student',
      department: 'Electronics',
      year: '2',
      section: 'B',
      phone: '9876543212',
      college: 'Test College',
      isEmailVerified: true
    });

    // Create test club for the organizer
    const testClub = await Club.findOrCreate({
      where: { name: 'Tech Club' },
      defaults: {
        name: 'Tech Club',
        description: 'A club for technology enthusiasts and innovators',
        logo: 'https://via.placeholder.com/200x200/667eea/white?text=Tech+Club',
        category: 'technical',
        organizerId: testOrganizer.id,
        organizerName: testOrganizer.name,
        organizerEmail: testOrganizer.email,
        organizerPhone: testOrganizer.phone,
        organizerYear: testOrganizer.year,
        organizerDepartment: testOrganizer.department,
        facultyName: 'Dr. John Smith',
        facultyEmail: 'faculty@test.com',
        facultyDepartment: 'Computer Science',
        isFacultyVerified: true,
        isActive: true,
        isApproved: true,
        establishedYear: 2020
      }
    });

    // Create test events
    const testEvent1 = await Event.findOrCreate({
      where: { name: 'Web Development Workshop' },
      defaults: {
        name: 'Web Development Workshop',
        description: 'Learn modern web development with React, Node.js, and MongoDB. This comprehensive workshop covers frontend and backend development.',
        poster: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
        venue: 'Computer Lab 1',
        collegeName: 'Test College',
        category: 'technical',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '10:00:00',
        maxParticipants: 50,
        organizerId: testOrganizer.id,
        clubId: testClub[0].id,
        isPublished: true,
        isActive: true,
        paymentRequired: true,
        paymentAmount: 299.00,
        paymentQR: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=organizer@paytm&pn=Tech%20Club&am=299&cu=INR',
        paymentInstructions: 'Scan the QR code and pay ₹299. Upload payment screenshot after payment.'
      }
    });

    const testEvent2 = await Event.findOrCreate({
      where: { name: 'AI/ML Seminar' },
      defaults: {
        name: 'AI/ML Seminar',
        description: 'Explore the latest trends in Artificial Intelligence and Machine Learning. Industry experts will share insights.',
        poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        venue: 'Auditorium',
        collegeName: 'Test College',
        category: 'technical',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '14:00:00',
        maxParticipants: 100,
        organizerId: testOrganizer.id,
        clubId: testClub[0].id,
        isPublished: true,
        isActive: true,
        paymentRequired: false,
        paymentAmount: 0.00
      }
    });

    const testEvent3 = await Event.findOrCreate({
      where: { name: 'Cultural Fest 2024' },
      defaults: {
        name: 'Cultural Fest 2024',
        description: 'Annual cultural festival with dance, music, drama, and art competitions. Prizes worth ₹50,000!',
        poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
        venue: 'Main Ground',
        collegeName: 'Test College',
        category: 'cultural',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        time: '09:00:00',
        maxParticipants: 200,
        organizerId: testOrganizer.id,
        clubId: testClub[0].id,
        isPublished: true,
        isActive: true,
        paymentRequired: true,
        paymentAmount: 150.00,
        paymentQR: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=organizer@paytm&pn=Tech%20Club&am=150&cu=INR',
        paymentInstructions: 'Registration fee: ₹150. Scan QR code to pay and upload screenshot.'
      }
    });

    // Create test registrations for the student
    const registration1 = await EventRegistration.findOrCreate({
      where: { 
        eventId: testEvent1[0].id,
        userId: testStudent.id 
      },
      defaults: {
        eventId: testEvent1[0].id,
        userId: testStudent.id,
        formData: {
          name: testStudent.name,
          email: testStudent.email,
          phone: testStudent.phone,
          department: testStudent.department,
          year: testStudent.year,
          section: testStudent.section
        },
        registrationStatus: 'approved',
        paymentStatus: 'verified',
        paymentScreenshot: 'https://via.placeholder.com/300x400/4CAF50/white?text=Payment+Screenshot',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        attended: false
      }
    });

    const registration2 = await EventRegistration.findOrCreate({
      where: { 
        eventId: testEvent2[0].id,
        userId: testStudent.id 
      },
      defaults: {
        eventId: testEvent2[0].id,
        userId: testStudent.id,
        formData: {
          name: testStudent.name,
          email: testStudent.email,
          phone: testStudent.phone,
          department: testStudent.department,
          year: testStudent.year,
          section: testStudent.section
        },
        registrationStatus: 'pending',
        paymentStatus: 'verified',
        registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        attended: false
      }
    });

    // Create registration for second student
    const registration3 = await EventRegistration.findOrCreate({
      where: { 
        eventId: testEvent1[0].id,
        userId: testStudent2.id 
      },
      defaults: {
        eventId: testEvent1[0].id,
        userId: testStudent2.id,
        formData: {
          name: testStudent2.name,
          email: testStudent2.email,
          phone: testStudent2.phone,
          department: testStudent2.department,
          year: testStudent2.year,
          section: testStudent2.section
        },
        registrationStatus: 'approved',
        paymentStatus: 'verified',
        paymentScreenshot: 'https://via.placeholder.com/300x400/2196F3/white?text=Payment+Screenshot',
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        attended: true,
        attendedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    });

    console.log('✅ Test users created successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    STUDENT ACCOUNT                      │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    student@test.com                              │');
    console.log('│ Password: password123                                   │');
    console.log('│ Name:     Test Student                                  │');
    console.log('│ Dept:     Computer Science, Year 3, Section A          │');
    console.log('│ Features: - 2 event registrations                      │');
    console.log('│           - 1 approved (with QR code)                  │');
    console.log('│           - 1 pending approval                          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                   ORGANIZER ACCOUNT                     │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    organizer@test.com                           │');
    console.log('│ Password: password123                                   │');
    console.log('│ Name:     Test Organizer                                │');
    console.log('│ Club:     Tech Club (verified)                         │');
    console.log('│ Features: - 3 published events                         │');
    console.log('│           - Event management access                     │');
    console.log('│           - Registration approvals                      │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                  SECOND STUDENT                         │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    student2@test.com                            │');
    console.log('│ Password: password123                                   │');
    console.log('│ Name:     Alice Johnson                                 │');
    console.log('│ Dept:     Electronics, Year 2, Section B               │');
    console.log('│ Features: - 1 approved registration                     │');
    console.log('│           - Marked as attended                          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🎯 Test Data Summary:');
    console.log('• 3 Events created (2 paid, 1 free)');
    console.log('• 3 Registrations created');
    console.log('• 1 Club created and verified');
    console.log('• All users have verified emails');
    console.log('• Ready for testing all features!');
    console.log('\n🚀 You can now test:');
    console.log('✓ Student login and event discovery');
    console.log('✓ Event registration process');
    console.log('✓ QR code generation for approved events');
    console.log('✓ Organizer event management');
    console.log('✓ Attendance marking system');
    console.log('✓ Registration approval workflow');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
};

// Run the script
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n✅ Test user creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUsers };