import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreateClub from '../clubs/CreateClub';
import FacultyVerification from '../clubs/FacultyVerification';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('welcome'); // welcome, create, verify
  const [clubData, setClubData] = useState(null);

  const handleCreateClub = () => {
    setCurrentView('create');
  };

  const handleClubCreated = (data) => {
    setClubData(data);
    setCurrentView('verify');
  };

  const handleVerificationSuccess = (data) => {
    // Refresh the page or redirect to main dashboard
    window.location.reload();
  };

  const handleBack = () => {
    setCurrentView('welcome');
    setClubData(null);
  };

  if (currentView === 'create') {
    return (
      <CreateClub 
        onBack={handleBack}
        onClubCreated={handleClubCreated}
      />
    );
  }

  if (currentView === 'verify' && clubData) {
    return (
      <FacultyVerification
        clubId={clubData.clubId}
        facultyEmail={clubData.facultyEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="organizer-dashboard">
      <div className="container">
        <div className="welcome-section">
          <h1>Welcome, {user?.name}!</h1>
          <p className="welcome-subtitle">
            You're registered as an Event Organizer. To start creating events, 
            you need to create and verify your club.
          </p>
        </div>

        <div className="organizer-actions">
          <div className="action-card">
            <div className="action-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Create Your Club</h3>
            <p>
              Set up your club profile to start organizing events. 
              Once verified, you'll be able to create and manage events.
            </p>
            <button 
              className="btn btn-primary btn-large"
              onClick={handleCreateClub}
            >
              Create and Verify Club
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>What happens next?</h3>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Create Club Profile</h4>
                <p>Provide your club details and description</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Faculty Verification</h4>
                <p>Faculty advisor receives OTP and verifies the club</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Start Creating Events</h4>
                <p>Once verified, create amazing events for students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;