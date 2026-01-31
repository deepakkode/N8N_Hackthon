import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resendOTPEmailJS } from '../../services/emailService';

const EmailVerification = ({ userId, email, onVerificationSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  const { verifyEmail } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyEmail(userId, otp);
    
    if (result.success) {
      onVerificationSuccess(result);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const result = await resendOTPEmailJS();
      
      if (result.success) {
        setTimer(600); // Reset timer to 10 minutes
        alert(result.message);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="verification-header">
          <div className="verification-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit OTP to</p>
          <strong>{email}</strong>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="otp-input"
              maxLength="6"
              required
            />
          </div>

          <div className="timer-section">
            {timer > 0 ? (
              <p className="timer">OTP expires in: {formatTime(timer)}</p>
            ) : (
              <p className="timer expired">OTP has expired</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the OTP?</p>
          <button 
            type="button" 
            className="link-button" 
            onClick={handleResendOTP}
            disabled={resendLoading || timer > 540} // Allow resend after 1 minute
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;