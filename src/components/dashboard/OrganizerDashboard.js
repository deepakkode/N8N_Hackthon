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
  const [existingClub, setExistingClub] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isClubVerified) {
      fetchOrganizerEvents();
    } else {
      checkExistingClub();
    }
  }, [user]);

  const checkExistingClub = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/clubs/my-club`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingClub(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error checking existing club:', error);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleContinueVerification = () => {
    if (existingClub) {
      setClubData({
        clubId: existingClub.id,
        facultyEmail: existingClub.facultyEmail
      });
      setCurrentView('verify');
    }
  };

  const handleDeleteExistingClub = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/clubs/my-club`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingClub(null);
      alert('Club deleted successfully. You can now create a new club.');
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Failed to delete club. Please try again.');
    }
  };

  const handleClubCreated = (data) => {
    setClubData(data);
    setCurrentView('verify');
  };

  const handleVerificationSuccess = (data) => {
    // Refresh the page or redirect to main dashboard
    setExistingClub(null);
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
      <div className="organizer-dashboard-verified">
        <div className="clean-container">
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
              <h3>Club Status</h3>
              <p className="stat-text success">Verified</p>
            </div>
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p className="stat-number">{events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0)}</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowCreateEvent(true)}
            >
              Create New Event
            </button>
          </div>

          <div className="events-section">
            <h2>My Events</h2>
            {events.length === 0 ? (
              <div className="no-events-card">
                <p>You haven't created any events yet.</p>
                <p>Click "Create New Event" to get started!</p>
              </div>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div key={event._id} className="event-item-clean">
                    <div className="event-info">
                      <h3>{event.title || event.name}</h3>
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>📍 {event.venue || event.location}</span>
                        <span>👥 {event.registrations?.length || 0} applications</span>
                      </div>
                    </div>
                    <div className="event-status">
                      <span className={`status-badge ${event.isPublished ? 'published' : 'draft'}`}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    <div className="organizer-dashboard-clean">
      <div className="clean-container">
        <div className="welcome-section">
          <h1>Welcome, {user?.name}</h1>
          <p className="welcome-subtitle">You're registered as an Event Organizer. To start creating events, you need to create and verify your club.</p>
        </div>

        {existingClub ? (
          <div className="existing-club-section">
            <div className="existing-club-card">
              <h2>Your Existing Club</h2>
              <div className="club-info">
                <h3>{existingClub.name}</h3>
                <p>{existingClub.description}</p>
                <div className="club-status">
                  <span className={`status-badge ${existingClub.isFacultyVerified ? 'verified' : 'pending'}`}>
                    {existingClub.isFacultyVerified ? 'Faculty Verified' : 'Pending Faculty Verification'}
                  </span>
                </div>
                {!existingClub.isFacultyVerified && (
                  <p className="verification-info">
                    Faculty verification email was sent to: <strong>{existingClub.facultyEmail}</strong>
                  </p>
                )}
              </div>
              
              <div className="club-actions">
                {!existingClub.isFacultyVerified ? (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={handleContinueVerification}
                    >
                      Continue Verification
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleDeleteExistingClub}
                    >
                      Delete & Create New Club
                    </button>
                  </>
                ) : (
                  <p className="success-message">Your club is verified! Refresh the page to access your dashboard.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="main-action-card">
            <h2>Create Your Club</h2>
            <p>Set up your club profile to start organizing events. Once verified, you'll be able to create and manage events.</p>
            
            <button 
              className="btn btn-primary btn-large"
              onClick={handleCreateClub}
            >
              Create and Verify Club
            </button>
          </div>
        )}

        <div className="process-info">
          <h3>Process Steps:</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div>
                <strong>Create Club Profile</strong>
                <p>Provide your club details and description</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div>
                <strong>Faculty Verification</strong>
                <p>Faculty advisor receives OTP and verifies the club</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div>
                <strong>Start Creating Events</strong>
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