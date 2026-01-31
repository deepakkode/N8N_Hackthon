const crypto = require('crypto');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate college email domain
const validateCollegeEmail = (email) => {
  const collegeDomain = process.env.COLLEGE_DOMAIN || 'klu.ac.in';
  return email.toLowerCase().endsWith(`@${collegeDomain}`);
};

// Send SMS OTP using Twilio (Free tier available)
const sendSMSOTP = async (phoneNumber, otp, name) => {
  console.log(`📱 Sending SMS OTP to: ${phoneNumber}`);
  
  // For development - just log the OTP (you can see it in console)
  console.log('🔢 SMS OTP for', name, ':', otp);
  console.log('📱 Phone:', phoneNumber);
  console.log('⏰ Valid for 10 minutes');
  
  // Simulate SMS sending
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ SMS sent successfully (simulated)');
      resolve({ 
        success: true, 
        messageId: `sms_${Date.now()}`,
        message: 'SMS OTP sent successfully'
      });
    }, 1000);
  });
};

// Alternative: Use WhatsApp API (Free with Twilio)
const sendWhatsAppOTP = async (phoneNumber, otp, name) => {
  console.log(`📱 Sending WhatsApp OTP to: ${phoneNumber}`);
  console.log('🔢 WhatsApp OTP for', name, ':', otp);
  
  // For development - log the OTP
  return { 
    success: true, 
    messageId: `whatsapp_${Date.now()}`,
    message: 'WhatsApp OTP sent successfully'
  };
};

// Console OTP (Development Mode)
const sendConsoleOTP = async (email, otp, name) => {
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DEVELOPMENT OTP - COPY THIS:');
  console.log('='.repeat(50));
  console.log(`👤 Name: ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Valid for: 10 minutes`);
  console.log('='.repeat(50));
  console.log('📋 Copy the OTP above and paste it in your app!');
  console.log('='.repeat(50) + '\n');
  
  return { 
    success: true, 
    messageId: `console_${Date.now()}`,
    message: 'OTP displayed in console - check your terminal!'
  };
};

// Main OTP sending function with multiple methods
const sendOTP = async (email, phone, otp, name, method = 'console') => {
  console.log(`🚀 Sending OTP via ${method} method...`);
  
  switch (method) {
    case 'sms':
      if (phone) {
        return await sendSMSOTP(phone, otp, name);
      } else {
        console.log('⚠️ No phone number provided, falling back to console');
        return await sendConsoleOTP(email, otp, name);
      }
      
    case 'whatsapp':
      if (phone) {
        return await sendWhatsAppOTP(phone, otp, name);
      } else {
        console.log('⚠️ No phone number provided, falling back to console');
        return await sendConsoleOTP(email, otp, name);
      }
      
    case 'console':
    default:
      return await sendConsoleOTP(email, otp, name);
  }
};

// Faculty verification (also using console for now)
const sendFacultyVerificationOTP = async (email, otp, clubName, organizerName) => {
  console.log('\n' + '='.repeat(60));
  console.log('🏫 FACULTY VERIFICATION OTP:');
  console.log('='.repeat(60));
  console.log(`👨‍🏫 Faculty Email: ${email}`);
  console.log(`🏛️ Club Name: ${clubName}`);
  console.log(`👤 Organizer: ${organizerName}`);
  console.log(`🔢 Verification OTP: ${otp}`);
  console.log(`⏰ Valid for: 15 minutes`);
  console.log('='.repeat(60));
  console.log('📋 Faculty member should use this OTP to verify the club');
  console.log('='.repeat(60) + '\n');
  
  return { success: true, messageId: `faculty_${Date.now()}` };
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendOTP,
  sendSMSOTP,
  sendWhatsAppOTP,
  sendConsoleOTP,
  sendFacultyVerificationOTP,
  validateCollegeEmail
};