import emailjs from '@emailjs/browser';

// EmailJS Configuration - Update these with your actual IDs from EmailJS dashboard
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mr6x3f9', // Your EmailJS service ID
  TEMPLATE_ID: 'template_qxa90y3', // Your EmailJS template ID
  PUBLIC_KEY: 'dY6qM2tFVpzpBYqhm' // Your EmailJS public key
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Send OTP Email using EmailJS
export const sendOTPEmailJS = async (email, otp, name) => {
  console.log('📧 Sending OTP via EmailJS to:', email);
  console.log('🔧 Using EmailJS config:', {
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templateId: EMAILJS_CONFIG.TEMPLATE_ID,
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 10) + '...'
  });
  
  try {
    const templateParams = {
      email: email,        // This matches {{email}} in your template
      passcode: otp,       // This matches {{passcode}} in your template
      to_email: email,     // Backup field
      to_name: name,       // User name
      app_name: 'Vivento',
      from_name: 'Vivento Campus Events'
    };

    console.log('📤 Sending email with template params:', templateParams);
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ EmailJS Success Response:', response);
    console.log('📧 OTP sent to real email address:', email);
    console.log('🎯 Email delivered via EmailJS!');
    
    return {
      success: true,
      messageId: response.text,
      service: 'emailjs',
      message: `OTP sent to your email: ${email}`
    };
    
  } catch (error) {
    console.error('❌ EmailJS Error:', error);
    console.error('❌ Error details:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    
    // Provide specific error messages
    let errorMessage = 'EmailJS failed to send email';
    if (error.text) {
      if (error.text.includes('service')) {
        errorMessage = 'Invalid EmailJS service ID. Please check your EmailJS dashboard.';
      } else if (error.text.includes('template')) {
        errorMessage = 'Invalid EmailJS template ID. Please check your EmailJS dashboard.';
      } else if (error.text.includes('public_key')) {
        errorMessage = 'Invalid EmailJS public key. Please check your configuration.';
      } else {
        errorMessage = `EmailJS Error: ${error.text}`;
      }
    }
    
    // Fallback to console display
    console.log('\n' + '🎯'.repeat(25));
    console.log('📧 EMAIL OTP - EMAILJS FAILED, SHOWING IN CONSOLE');
    console.log('🎯'.repeat(25));
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log(`❌ Error: ${errorMessage}`);
    console.log('🎯'.repeat(25) + '\n');
    
    return {
      success: false,
      error: errorMessage,
      service: 'console',
      message: 'EmailJS failed - OTP shown in console'
    };
  }
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Resend OTP function for EmailVerification component
export const resendOTPEmailJS = async () => {
  try {
    // Get temporary registration data
    const tempData = localStorage.getItem('tempRegistration');
    if (!tempData) {
      throw new Error('Registration session expired. Please register again.');
    }

    const registrationData = JSON.parse(tempData);
    
    // Generate new OTP
    const newOtp = generateOTP();
    
    // Send new OTP via EmailJS
    const emailResult = await sendOTPEmailJS(registrationData.email, newOtp, registrationData.name);
    
    if (!emailResult.success) {
      throw new Error('Failed to send OTP email');
    }
    
    // Update stored registration data with new OTP
    const updatedData = {
      ...registrationData,
      otp: newOtp,
      otpExpires: Date.now() + 10 * 60 * 1000 // Reset expiry to 10 minutes
    };
    
    localStorage.setItem('tempRegistration', JSON.stringify(updatedData));
    
    return {
      success: true,
      message: 'New OTP sent successfully!'
    };
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend OTP'
    };
  }
};

export default {
  sendOTPEmailJS,
  generateOTP,
  resendOTPEmailJS
};