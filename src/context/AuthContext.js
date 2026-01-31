import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { sendOTPEmailJS, generateOTP } from '../services/emailService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [pendingVerification, setPendingVerification] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Axios authorization header set with token');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Axios authorization header removed');
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Frontend login attempt:', { email, hasPassword: !!password });
      
      // Basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password
      });

      console.log('Login response:', response.data);

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setPendingVerification(null);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      
      if (errorData?.needsVerification) {
        setPendingVerification({
          userId: errorData.userId,
          email: email
        });
        return { success: false, needsVerification: true };
      }
      
      // Handle specific error messages
      let message = 'Login failed';
      if (errorData?.message) {
        if (errorData.message.includes('verify your email')) {
          message = 'Please verify your email first. Check your inbox for the verification code.';
        } else if (errorData.message.includes('Invalid credentials')) {
          message = 'Invalid email or password. Please check your credentials.';
        } else {
          message = errorData.message;
        }
      }
      
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🚀 Starting registration...');
      
      // FIRST: Check if user already exists BEFORE sending OTP
      console.log('🔍 Checking if user already exists...');
      try {
        const checkResponse = await axios.post(`${API_BASE_URL}/auth/check-user-exists`, {
          email: userData.email
        });
        
        if (checkResponse.data.exists) {
          console.log('❌ User already exists');
          return { 
            success: false, 
            error: 'An account with this email already exists. Please login instead.' 
          };
        }
        console.log('✅ Email is available for registration');
      } catch (error) {
        console.error('Error checking user existence:', error);
        return { 
          success: false, 
          error: 'Unable to verify email availability. Please try again.' 
        };
      }
      
      // SECOND: Generate OTP and send via EmailJS (only if user doesn't exist)
      const otp = generateOTP();
      console.log('🔢 Generated OTP:', otp);
      
      console.log('📧 Sending OTP via EmailJS...');
      const emailResult = await sendOTPEmailJS(userData.email, otp, userData.name);
      
      if (!emailResult.success) {
        console.log('❌ EmailJS failed');
        return { success: false, error: 'Failed to send OTP email. Please try again.' };
      }
      
      console.log('✅ EmailJS OTP sent successfully!');
      
      // THIRD: Store registration data temporarily (don't create user in DB yet)
      const tempRegistrationData = {
        ...userData,
        otp: otp,
        otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
        tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Store in localStorage temporarily
      localStorage.setItem('tempRegistration', JSON.stringify(tempRegistrationData));
      
      setPendingVerification({ 
        tempId: tempRegistrationData.tempId,
        email: userData.email,
        isTemp: true // Flag to indicate this is temporary registration
      });
      
      return { 
        success: true, 
        needsVerification: true,
        message: `OTP sent to your email: ${userData.email}. Please check your inbox.`
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const verifyEmail = async (userIdOrTempId, otp) => {
    try {
      // Check if this is a temporary registration (new flow)
      if (pendingVerification?.isTemp) {
        console.log('🔍 Verifying temporary registration...');
        
        // Get temporary registration data
        const tempData = localStorage.getItem('tempRegistration');
        if (!tempData) {
          return { success: false, error: 'Registration session expired. Please register again.' };
        }
        
        const registrationData = JSON.parse(tempData);
        
        // Check if OTP matches
        if (registrationData.otp !== otp) {
          return { success: false, error: 'Invalid OTP. Please check your email and try again.' };
        }
        
        // Check if OTP expired
        if (Date.now() > registrationData.otpExpires) {
          localStorage.removeItem('tempRegistration');
          return { success: false, error: 'OTP has expired. Please register again.' };
        }
        
        console.log('✅ OTP verified! Creating user in database...');
        
        // Now create the user in MongoDB (without OTP fields)
        const { otp: _, otpExpires: __, tempId: ___, ...userData } = registrationData;
        
        const response = await axios.post(`${API_BASE_URL}/auth/create-verified-user`, userData);
        const { token: newToken, user: userData2 } = response.data;
        
        // Clean up temporary data
        localStorage.removeItem('tempRegistration');
        
        // Set user as logged in
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData2);
        setPendingVerification(null);
        
        console.log('✅ User created and logged in successfully!');
        return { success: true };
      } else {
        // Old flow for existing users
        const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
          userId: userIdOrTempId,
          otp
        });

        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        setPendingVerification(null);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const message = error.response?.data?.message || 'Verification failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPendingVerification(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    register,
    verifyEmail,
    logout,
    loading,
    pendingVerification,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};