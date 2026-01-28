import React, { useState } from 'react';
import axios from 'axios';

const FacultyVerification = ({ clubId, facultyEmail, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5002/api/clubs/verify-faculty', {
        clubId,
        otp
      });

      onVerificationSuccess(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5002/api/clubs/resend-faculty-otp', { clubId });
      alert('OTP sent successfully to faculty!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="faculty-verification-container">
      <div className="faculty-verification-card">
        <div className="verification-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          
          <div className="verification-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2>Faculty Verification Required</h2>
          <p>We've sent a verification OTP to your faculty advisor</p>
          <strong>{facultyEmail}</strong>
          <p className="verification-note">
            Please ask your faculty advisor to check their email and provide the OTP to complete club verification.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="otp">Faculty Verification OTP</label>
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
            <small className="form-hint">Ask your faculty advisor for the 6-digit OTP</small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-large" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Club'}
          </button>
        </form>

        <div className="resend-section">
          <p>Faculty didn't receive the OTP?</p>
          <button 
            type="button" 
            className="link-button" 
            onClick={handleResendOTP}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend OTP to Faculty'}
          </button>
        </div>

        <div className="info-section">
          <h4>What happens next?</h4>
          <ul>
            <li>Faculty advisor receives OTP via email</li>
            <li>Faculty provides OTP to verify the club</li>
            <li>Once verified, you can start creating events</li>
            <li>Your club will be visible to all students</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FacultyVerification;