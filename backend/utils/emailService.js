const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vivento - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vivento</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Campus Events Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #64748b; margin-bottom: 20px;">Hi ${name},</p>
          <p style="color: #64748b; margin-bottom: 30px;">Please use the following OTP to verify your email address:</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <p style="color: #64748b; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #64748b; margin: 0;">If you didn't request this verification, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2024 Vivento. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send Faculty Verification Email
const sendFacultyVerificationEmail = async (email, otp, clubName, organizerName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vivento - Faculty Verification Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vivento</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Campus Events Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Club Verification Request</h2>
          <p style="color: #64748b; margin-bottom: 20px;">Dear Faculty Member,</p>
          <p style="color: #64748b; margin-bottom: 20px;">A student organizer <strong>${organizerName}</strong> has requested to create a club named <strong>"${clubName}"</strong> and has listed you as the faculty coordinator.</p>
          <p style="color: #64748b; margin-bottom: 30px;">Please use the following OTP to verify and approve this club:</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <p style="color: #64748b; margin-bottom: 20px;">This OTP will expire in 15 minutes.</p>
          <p style="color: #64748b; margin: 0;">If you are not aware of this request or do not approve, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2024 Vivento. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Faculty verification email sent successfully');
  } catch (error) {
    console.error('Error sending faculty verification email:', error);
    throw error;
  }
};

// New: Event Application Status Notification
const sendApplicationStatusEmail = async (email, name, eventName, status, eventDate, eventVenue) => {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusText = isApproved ? 'Approved' : 'Rejected';
  const statusMessage = isApproved 
    ? 'Congratulations! Your application has been approved.' 
    : 'Unfortunately, your application was not approved this time.';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Vivento - Application ${statusText}: ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vivento</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Campus Events Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: ${statusColor}; color: #ffffff; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; margin-bottom: 20px;">
              Application ${statusText}
            </div>
            <h2 style="color: #1e293b; margin: 0;">${eventName}</h2>
          </div>
          
          <p style="color: #64748b; margin-bottom: 20px;">Hi ${name},</p>
          <p style="color: #64748b; margin-bottom: 30px;">${statusMessage}</p>
          
          ${isApproved ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-bottom: 15px;">Event Details:</h3>
              <p style="color: #15803d; margin: 5px 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="color: #15803d; margin: 5px 0;"><strong>Venue:</strong> ${eventVenue}</p>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1d4ed8; margin-bottom: 10px;">🎉 You're all set!</h4>
              <p style="color: #1e40af; margin: 0;">Check your "My Events" section in Vivento for more details and updates about this event.</p>
            </div>
          ` : `
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0;">Don't worry! Keep exploring other exciting events on Vivento.</p>
            </div>
          `}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2024 Vivento. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application ${status} email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending application ${status} email:`, error);
    throw error;
  }
};

// New: Event Reminder Notification
const sendEventReminderEmail = async (email, name, eventName, daysLeft, eventDate, eventTime, eventVenue) => {
  const reminderMessages = {
    7: "One week to go! 🗓️",
    3: "Just 3 days left! ⏰", 
    1: "Tomorrow is the big day! 🚀",
    0: "Today is the day! 🎉"
  };

  const reminderEmojis = {
    7: "📅",
    3: "⚡", 
    1: "🔥",
    0: "🎊"
  };

  const message = reminderMessages[daysLeft] || `${daysLeft} days to go! 📆`;
  const emoji = reminderEmojis[daysLeft] || "📆";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${emoji} ${message} - ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vivento</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Campus Events Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
            <h2 style="color: #1e293b; margin-bottom: 10px;">${message}</h2>
            <h3 style="color: #2563eb; margin: 0;">${eventName}</h3>
          </div>
          
          <p style="color: #64748b; margin-bottom: 20px;">Hi ${name},</p>
          
          ${daysLeft === 0 ? `
            <p style="color: #64748b; margin-bottom: 30px;">Today is the day! Your event is happening today. We're excited for you! 🎉</p>
          ` : daysLeft === 1 ? `
            <p style="color: #64748b; margin-bottom: 30px;">Tomorrow is the big day! Make sure you're prepared and ready to participate. 🚀</p>
          ` : `
            <p style="color: #64748b; margin-bottom: 30px;">Get ready! Your registered event is coming up in ${daysLeft} days. Time to prepare! ⚡</p>
          `}
          
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #1d4ed8; margin-bottom: 15px; text-align: center;">📍 Event Details</h3>
            <div style="display: grid; gap: 10px;">
              <p style="color: #1e40af; margin: 0;"><strong>📅 Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="color: #1e40af; margin: 0;"><strong>🕐 Time:</strong> ${eventTime}</p>
              <p style="color: #1e40af; margin: 0;"><strong>📍 Venue:</strong> ${eventVenue}</p>
            </div>
          </div>
          
          ${daysLeft <= 1 ? `
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #d97706; margin-bottom: 10px;">💡 Last Minute Tips:</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Double-check the venue location</li>
                <li>Arrive 15 minutes early</li>
                <li>Bring any required materials</li>
                <li>Don't forget your ID card</li>
              </ul>
            </div>
          ` : `
            <div style="background: #f0f9ff; border: 1px solid #7dd3fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-bottom: 10px;">🎯 Preparation Tips:</h4>
              <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                <li>Mark your calendar</li>
                <li>Prepare any required materials</li>
                <li>Plan your travel to the venue</li>
                <li>Stay updated on Vivento for any announcements</li>
              </ul>
            </div>
          `}
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; margin: 0;">Check your "My Events" section in Vivento for more details!</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2024 Vivento. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Event reminder email sent successfully to ${email} for ${eventName} (${daysLeft} days)`);
  } catch (error) {
    console.error(`Error sending event reminder email:`, error);
    throw error;
  }
};

// Validate college email
const validateCollegeEmail = (email) => {
  const collegeDomain = process.env.COLLEGE_DOMAIN || 'klu.ac.in';
  return email.endsWith(`@${collegeDomain}`);
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendOTPEmail,
  sendFacultyVerificationEmail,
  sendApplicationStatusEmail,
  sendEventReminderEmail,
  validateCollegeEmail
};