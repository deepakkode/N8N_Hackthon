import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreateClub from '../clubs/CreateClub';
import FacultyVerification from '../clubs/FacultyVerification';
import AddEventModal from '../events/AddEventModal';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const OrganizerDashboard = ({ user: propUser }) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;
  
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, create-club, verify, create-event
  const [clubData, setClubData] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isClubVerified) {
      fetchOrganizerEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrganizerEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/organizer/my-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = () => {
    setCurrentView('create-club');
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
    setCurrentView('dashboard');
    setClubData(null);
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setShowCreateEvent(false);
  };

  if (currentView === 'create-club') {
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

  // Dashboard for verified organizers
  if (user?.isClubVerified) {
    return (
      <div className="organizer-dashboard verified">
        <div className="container">
          <div className="dashboard-header">
            <h1>Organizer Dashboard</h1>
            <p>Welcome back, {user?.name}! Manage your events and club activities.</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Your Events</h3>
              <p className="stat-number">{events.length}</p>
            </div>
            <div className="stat-card">
              <h3>Club</h3>
              <p className="stat-text">{user?.clubName || 'Verified'}</p>
            </div>
            <div className="stat-card">
              <h3>Status</h3>
              <p className="stat-text success">Active</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <button 
              className="btn btn-primary"
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
              Create New Event
            </button>
          </div>

          <div className="events-section">
            <div className="organizer-events">
              <h2>My Organized Events</h2>
              {events.length === 0 ? (
                <div className="no-events">
                  <p>You haven't created any events yet.</p>
                  <p>Click the "Create New Event" button to create your first event!</p>
                </div>
              ) : (
                <div className="events-list">
                  {events.map(event => (
                    <div key={event._id} className="event-item">
                      <h3>{event.title || event.name}</h3>
                      <p>{event.description}</p>
                      <div className="event-details">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>📍 {event.venue || event.location}</span>
                        <span>👥 {event.registrations?.length || 0} applications</span>
                      </div>
                      <div className="event-status">
                        <span className={`status ${event.isPublished ? 'published' : 'draft'}`}>
                          {event.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showCreateEvent && (
            <AddEventModal
              user={user}
              onClose={() => setShowCreateEvent(false)}
              onEventCreated={handleEventCreated}
            />
          )}
        </div>
      </div>
    );
  }

  // Dashboard for unverified organizers
  return (
    <div className="organizer-dashboard unverified">
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