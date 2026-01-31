import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const FacultyVerification = ({ clubId, facultyEmail, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    console.log('Submitting faculty verification:', {
      clubId,
      otpArray: otp,
      otpString,
      otpLength: otpString.length
    });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/clubs/verify-faculty`, {
        clubId,
        otp: otpString
      });

      console.log('✅ Faculty verification successful:', response.data);
      onVerificationSuccess(response.data);
    } catch (error) {
      console.error('❌ Faculty verification failed:', error.response?.data);
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/clubs/resend-faculty-otp`, { clubId });
      setTimer(900); // Reset timer
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear OTP
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-toast';
      successMsg.textContent = 'New OTP sent to faculty advisor!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const otpComplete = otp.every(digit => digit !== '');

  return (
    <div className="faculty-verification-container">
      <div className="faculty-verification-wrapper">
        <div className="verification-header">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Club Details
          </button>
          <div className="header-content">
            <h1>Faculty Verification</h1>
            <p>Almost there! Your club needs faculty approval to get started</p>
          </div>
        </div>

        <div className="verification-card">
          {/* Success Icon and Status */}
          <div className="verification-status">
            <div className="status-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>OTP Sent Successfully!</h2>
            <p>We've sent a verification code to your faculty advisor</p>
          </div>

          {/* Faculty Info Card */}
          <div className="faculty-info-card">
            <div className="faculty-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="faculty-details">
              <h4>Faculty Advisor</h4>
              <p className="faculty-email">{facultyEmail}</p>
              <span className="status-badge">OTP Sent</span>
            </div>
          </div>

          {/* Testing Notice */}
          <div className="testing-notice">
            <div className="notice-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="notice-content">
              <h4>Testing Mode</h4>
              <p>If the faculty advisor doesn't receive the email, you can use the bypass code <strong>123456</strong> for testing purposes.</p>
            </div>
          </div>

          {/* Timer */}
          <div className="timer-section">
            <div className="timer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="timer-content">
              {timer > 0 ? (
                <>
                  <span className="timer-label">OTP expires in</span>
                  <span className="timer-value">{formatTime(timer)}</span>
                </>
              ) : (
                <>
                  <span className="timer-label expired">OTP has expired</span>
                  <span className="timer-value expired">Please request a new one</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <div className="error-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-section">
              <label className="form-label">Enter Verification Code</label>
              <p className="form-description">Ask your faculty advisor for the 6-digit code sent to their email</p>
              
              <div className="otp-input-group">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="otp-digit"
                    maxLength="1"
                    pattern="[0-9]"
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-large" 
                disabled={loading || !otpComplete || timer === 0}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Verifying Club...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verify & Complete Setup
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resend Section */}
          <div className="resend-section">
            <p>Faculty didn't receive the code?</p>
            <button 
              type="button" 
              className={`btn-link ${!canResend && !timer === 0 ? 'disabled' : ''}`}
              onClick={handleResendOTP}
              disabled={resendLoading || (!canResend && timer > 0)}
            >
              {resendLoading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Sending new code...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 15C19.9828 16.8399 18.8927 18.4815 17.3833 19.6451C15.8738 20.8087 14.0331 21.4297 12.1435 21.4084C10.2539 21.3871 8.42735 20.7246 6.94621 19.5274C5.46507 18.3302 4.40973 16.6649 3.94 14.8M3.51 9C4.01716 7.16007 5.10728 5.51848 6.61672 4.35487C8.12616 3.19125 9.96686 2.57031 11.8565 2.59159C13.7461 2.61287 15.5727 3.27537 17.0538 4.47262C18.535 5.66987 19.5903 7.33518 20.06 9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send New Code
                </>
              )}
            </button>
          </div>

          {/* Process Steps */}
          <div className="process-steps">
            <h4>Verification Process</h4>
            <div className="steps-list">
              <div className="step completed">
                <div className="step-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>OTP sent to faculty advisor</span>
              </div>
              <div className="step active">
                <div className="step-icon">
                  <span>2</span>
                </div>
                <span>Faculty provides verification code</span>
              </div>
              <div className="step">
                <div className="step-icon">
                  <span>3</span>
                </div>
                <span>Club approved and ready for events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyVerification;