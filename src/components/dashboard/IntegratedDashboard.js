import React, { useState } from 'react';
import CreateClub from '../clubs/CreateClub';
import AddEventModal from '../events/AddEventModal';

const IntegratedDashboard = ({ events, user, onEventCreated }) => {
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  if (user?.userType === 'organizer') {
    return (
      <div className="integrated-dashboard">
        <div className="organizer-dashboard">
          <div className="dashboard-header">
            <h2>Organizer Dashboard</h2>
            <p>Welcome, {user?.name}!</p>
          </div>

          <div className="organizer-stats">
            <div className="stat-card">
              <h3>Your Events</h3>
              <p className="stat-number">{events?.length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Club Status</h3>
              <p className="stat-text">
                {user?.isClubVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>

          <div className="organizer-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              {!user?.isClubVerified ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateClub(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Club
                </button>
              ) : (
                <button 
                  className="btn btn-success"
                  onClick={() => setShowCreateEvent(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 16L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Event
                </button>
              )}
            </div>
          </div>

          {!user?.isClubVerified && (
            <div className="info-banner">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-content">
                <h4>Club Verification Required</h4>
                <p>You need to create and verify your club before you can create events. Click "Create Club" to get started.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateClub && (
          <CreateClub 
            user={user}
            onClose={() => setShowCreateClub(false)}
            onClubCreated={() => {
              setShowCreateClub(false);
              // Refresh user data
              window.location.reload();
            }}
          />
        )}

        {showCreateEvent && (
          <AddEventModal
            user={user}
            onClose={() => setShowCreateEvent(false)}
            onEventCreated={(newEvent) => {
              setShowCreateEvent(false);
              if (onEventCreated) onEventCreated(newEvent);
            }}
          />
        )}
      </div>
    );
  }

  // Student dashboard
  return (
    <div className="integrated-dashboard">
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p>Welcome, {user?.name}!</p>
        </div>

        <div className="student-stats">
          <div className="stat-card">
            <h3>Available Events</h3>
            <p className="stat-number">{events?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Your College</h3>
            <p className="stat-text">{user?.college || 'KL University'}</p>
          </div>
        </div>

        <div className="student-info">
          <h3>Explore Events</h3>
          <p>Discover exciting events happening in your college. Click on "Discover" tab to browse all available events and register for the ones that interest you!</p>
        </div>
      </div>
    </div>
  );
};

export default IntegratedDashboard;