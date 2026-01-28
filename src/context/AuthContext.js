import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      const { userId, email } = response.data;
      
      setPendingVerification({ userId, email });
      
      return { success: true, needsVerification: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (userId, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        userId,
        otp
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setPendingVerification(null);
      
      return { success: true };
    } catch (error) {
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