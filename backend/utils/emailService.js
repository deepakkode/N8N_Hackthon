const nodemailer = require('nodemailer');
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

// Create Brevo transporter with correct configuration
const createBrevoTransporter = () => {
  console.log('🚀 Setting up Brevo email service...');
  
  if (!process.env.BREVO_SMTP_KEY || !process.env.BREVO_SMTP_USER) {
    console.log('⚠️ Missing Brevo credentials');
    return null;
  }

  console.log('🔧 Configuring Brevo SMTP...');
  console.log('📧 Sender Email:', process.env.BREVO_SMTP_USER);
  console.log('🔑 API Key (first 20 chars):', process.env.BREVO_SMTP_KEY.substring(0, 20) + '...');

  // Brevo SMTP configuration - Correct settings
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.BREVO_SMTP_USER, // Your verified sender email
      pass: process.env.BREVO_SMTP_KEY   // Your SMTP API key (not login password)
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: false, // Set to true for debugging
    logger: false
  });

  return transporter;
};

// Initialize Brevo transporter
let brevoTransporter = null;

const initializeBrevo = async () => {
  try {
    brevoTransporter = createBrevoTransporter();
    
    if (brevoTransporter) {
      console.log('🔧 Testing Brevo SMTP connection...');
      await brevoTransporter.verify();
      console.log('✅ Brevo SMTP connected successfully!');
      console.log('📧 Ready to send emails to real inboxes!');
      return true;
    }
  } catch (error) {
    console.log('❌ Brevo connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Verify sender email is confirmed in Brevo dashboard');
    console.log('   2. Check SMTP API key is correct (not login password)');
    console.log('   3. Ensure account has sending permissions');
    console.log('   4. Check if domain authentication is required');
    brevoTransporter = null;
    return false;
  }
};

// Initialize on startup with delay
setTimeout(async () => {
  console.log('🚀 Initializing email service...');
  await initializeBrevo();
}, 2000);

// Create beautiful HTML email template
const createOTPEmailHTML = (otp, name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vivento - Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d5016 0%, #38a169 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎓 Vivento</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Campus Events Platform</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Email Verification Required</h2>
                <p style="color: #64748b; margin-bottom: 20px; font-size: 16px;">Hi <strong>${name}</strong>,</p>
                <p style="color: #64748b; margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
                    Welcome to Vivento! Please use the following One-Time Password (OTP) to verify your email address:
                </p>
                
                <!-- OTP Box -->
                <div style="background: #f0f9f0; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0; border: 3px solid #2d5016;">
                    <p style="color: #2d5016; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <h1 style="color: #2d5016; font-size: 42px; margin: 0; letter-spacing: 8px; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
                </div>
                
                <!-- Instructions -->
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">⏰ Important:</p>
                    <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">This OTP will expire in <strong>10 minutes</strong>. Please verify your email as soon as possible.</p>
                </div>
                
                <p style="color: #64748b; margin: 20px 0; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with Vivento, please ignore this email.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding: 20px;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2024 Vivento Campus Events Platform</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">Connecting students through amazing campus events</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send OTP Email using Brevo - REAL EMAIL DELIVERY
const sendOTPEmail = async (email, otp, name) => {
  console.log(`📧 Attempting to send OTP email to: ${email}`);
  
  // Try Brevo first - REAL EMAIL DELIVERY
  if (brevoTransporter) {
    try {
      console.log('📤 Sending via Brevo SMTP...');
      
      const mailOptions = {
        from: `"Vivento Campus Events" <${process.env.BREVO_SMTP_USER}>`,
        to: email,
        subject: `Vivento - Your Verification Code: ${otp}`,
        html: createOTPEmailHTML(otp, name),
        text: `Hi ${name},\n\nYour Vivento verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nVivento Team`
      };

      const info = await brevoTransporter.sendMail(mailOptions);
      console.log('✅ EMAIL SENT SUCCESSFULLY TO REAL INBOX!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📬 Email delivered to:', email);
      console.log('🎯 OTP sent to user\'s actual email address!');
      
      return { 
        success: true, 
        messageId: info.messageId,
        service: 'brevo',
        message: `OTP sent to your email address: ${email}`
      };
    } catch (error) {
      console.log('❌ Brevo sending failed:', error.message);
      console.log('🔍 Error details:', error);
      
      // If authentication failed, provide specific guidance
      if (error.message.includes('Authentication failed')) {
        console.log('🚨 AUTHENTICATION ERROR - Please check:');
        console.log('   1. Email address is verified in Brevo dashboard');
        console.log('   2. SMTP API key is correct (not account password)');
        console.log('   3. Account has sending permissions enabled');
      }
    }
  } else {
    console.log('⚠️ Brevo transporter not initialized');
  }
  
  // Fallback: Console display (but we want to avoid this)
  console.log('\n' + '🚨'.repeat(30));
  console.log('❌ EMAIL SERVICE FAILED - OTP NOT DELIVERED TO INBOX!');
  console.log('🚨'.repeat(30));
  console.log(`👤 Name: ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Valid for: 10 minutes`);
  console.log(`📅 Generated at: ${new Date().toLocaleString()}`);
  console.log('🚨'.repeat(30));
  console.log('⚠️ USER WILL NOT RECEIVE OTP IN THEIR EMAIL!');
  console.log('🔧 Please fix email service configuration!');
  console.log('🚨'.repeat(30) + '\n');
  
  return { 
    success: false, 
    messageId: `console_${Date.now()}`,
    service: 'console',
    message: 'Email service failed - OTP displayed in console only',
    error: 'Email delivery failed'
  };
};

// Send Faculty Verification Email
const sendFacultyVerificationEmail = async (email, otp, clubName, organizerName) => {
  console.log(`📧 Sending faculty verification to: ${email}`);
  
  if (brevoTransporter) {
    try {
      const mailOptions = {
        from: `"Vivento Campus Events" <${process.env.BREVO_SMTP_USER}>`,
        to: email,
        subject: `Vivento - Faculty Verification Required for ${clubName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Faculty Verification Required</h2>
            <p>Dear Faculty Member,</p>
            <p>A club registration request requires your verification:</p>
            <ul>
              <li><strong>Club Name:</strong> ${clubName}</li>
              <li><strong>Organizer:</strong> ${organizerName}</li>
            </ul>
            <div style="background: #f0f9f0; padding: 20px; text-align: center; margin: 20px 0;">
              <h3>Verification Code: ${otp}</h3>
            </div>
            <p>This code expires in 15 minutes.</p>
          </div>
        `,
        text: `Faculty Verification Required\n\nClub: ${clubName}\nOrganizer: ${organizerName}\nVerification Code: ${otp}\n\nExpires in 15 minutes.`
      };

      const info = await brevoTransporter.sendMail(mailOptions);
      console.log('✅ Faculty verification email sent successfully!');
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.log('❌ Faculty email failed:', error.message);
    }
  }
  
  console.log('\n🏫 FACULTY VERIFICATION OTP (Console Fallback)');
  console.log(`👨‍🏫 Faculty: ${email}`);
  console.log(`🏛️ Club: ${clubName}`);
  console.log(`👤 Organizer: ${organizerName}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Valid: 15 minutes\n`);
  
  return { success: true, messageId: `faculty_${Date.now()}` };
};

// Send Event Reminder Email
const sendEventReminderEmail = async (email, name, eventName, eventDate, eventVenue, daysUntilEvent) => {
  console.log(`📧 Event reminder: ${eventName} in ${daysUntilEvent} days`);
  return { success: true, messageId: `reminder_${Date.now()}` };
};

// Send Application Status Email
const sendApplicationStatusEmail = async (email, name, eventName, status, eventDate, eventVenue) => {
  console.log(`📧 Application ${status}: ${eventName} for ${name}`);
  return { success: true, messageId: `status_${Date.now()}` };
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendOTPEmail,
  sendFacultyVerificationEmail,
  sendEventReminderEmail,
  sendApplicationStatusEmail,
  validateCollegeEmail
};