import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { API_BASE_URL } from './config/api';
import AuthPage from './components/auth/AuthPage';
import OrganizerDashboard from './components/dashboard/OrganizerDashboard';
import Header from './components/dashboard/Header';
import AddEventModal from './components/events/AddEventModal';

// Main Dashboard Component for Students
const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('events'); // events, clubs, profile

  const { user, logout } = useAuth();

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available, skipping events fetch');
        setEvents([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        // Token is invalid, logout user
        logout();
      } else {
        setError('Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch events if user is authenticated
    if (user && user.isEmailVerified) {
      fetchEvents();
    }
  }, [user]);

  const addEvent = async (newEvent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to create events');
        return;
      }

      // Extract only the basic event fields for initial creation
      const basicEventData = {
        name: newEvent.name,
        description: newEvent.description,
        poster: typeof newEvent.poster === 'string' ? newEvent.poster : null,
        venue: newEvent.venue,
        collegeName: newEvent.collegeName,
        category: newEvent.category,
        date: newEvent.date,
        time: newEvent.time,
        maxParticipants: newEvent.maxParticipants
      };

      console.log('Creating event with data:', basicEventData);

      const response = await axios.post(`${API_BASE_URL}/events`, basicEventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const createdEvent = response.data.event;
      console.log('Event created successfully:', createdEvent._id);

      // If there's a custom registration form, update it
      if (newEvent.registrationForm && newEvent.registrationForm.fields.length > 3) {
        try {
          console.log('Updating registration form...');
          await axios.put(`${API_BASE_URL}/events/${createdEvent._id}/form`, {
            registrationForm: newEvent.registrationForm
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Registration form updated successfully');
        } catch (formError) {
          console.error('Error updating registration form:', formError);
        }
      }

      // Always update payment details to publish the event
      try {
        console.log('Publishing event with payment details...');
        const paymentData = {
          paymentRequired: newEvent.paymentRequired || false,
          paymentAmount: newEvent.paymentAmount || 0,
          paymentQR: newEvent.paymentQR || null,
          paymentInstructions: newEvent.paymentInstructions || ''
        };
        
        console.log('Payment data:', paymentData);
        
        const paymentResponse = await axios.put(`${API_BASE_URL}/events/${createdEvent._id}/payment`, paymentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Event published successfully:', paymentResponse.data.message);
        
        // Update the created event with published status
        createdEvent.isPublished = true;
        
      } catch (paymentError) {
        console.error('Error publishing event:', paymentError);
        console.error('Payment error details:', paymentError.response?.data);
        alert('Event created but failed to publish. Please check with administrator.');
      }

      // Refresh events list to show the new event
      fetchEvents();
      setIsModalOpen(false);
      alert('Event created and published successfully!');
      
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response?.status === 401) {
        logout();
        alert('Session expired. Please log in again.');
      } else {
        const errorMessage = error.response?.data?.message || 'Unknown error';
        alert('Failed to create event: ' + errorMessage);
      }
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to delete events');
        return;
      }

      await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.response?.status === 401) {
        logout();
        alert('Session expired. Please log in again.');
      } else {
        alert('Failed to delete event: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to register for events');
        return;
      }

      // Send basic form data for simple registration
      const registrationData = {
        formData: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          department: user.department,
          year: user.year,
          section: user.section
        }
      };

      await axios.post(`${API_BASE_URL}/events/${eventId}/register`, registrationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(); // Refresh events to update attendee count
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      if (error.response?.status === 401) {
        logout();
        alert('Session expired. Please log in again.');
      } else {
        const errorMessage = error.response?.data?.message || 'Unknown error';
        alert('Failed to register: ' + errorMessage);
      }
    }
  };

  const unregisterFromEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to unregister from events');
        return;
      }

      await axios.post(`${API_BASE_URL}/events/${eventId}/unregister`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(); // Refresh events to update attendee count
    } catch (error) {
      console.error('Error unregistering from event:', error);
      if (error.response?.status === 401) {
        logout();
        alert('Session expired. Please log in again.');
      } else {
        alert('Failed to unregister: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        user={user}
        onAddEvent={() => setIsModalOpen(true)}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        
        {activeTab === 'events' && (
          <>
            <div className="dashboard-section">
              <h2>Events Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Events</h3>
                  <span className="stat-number">{events.length}</span>
                </div>
                <div className="stat-card">
                  <h3>Available</h3>
                  <span className="stat-number">{events.filter(e => new Date(e.date) >= new Date()).length}</span>
                </div>
                <div className="stat-card">
                  <h3>Categories</h3>
                  <span className="stat-number">{[...new Set(events.map(e => e.category))].length}</span>
                </div>
              </div>
            </div>
            
            <div className="events-section">
              <h2>Available Events</h2>
              {events.length === 0 ? (
                <div className="no-events">
                  <p>No events available. {user?.userType === 'organizer' ? 'Create your first event!' : 'Check back later for new events!'}</p>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map(event => (
                    <div key={event._id} className="event-card">
                      <div className="event-header">
                        <span className="category-badge" style={{backgroundColor: '#2563eb'}}>
                          {event.category}
                        </span>
                      </div>
                      
                      <h3 className="event-title">{event.title || event.name}</h3>
                      
                      <div className="event-details">
                        <div className="event-datetime">
                          <span className="event-date">📅 {new Date(event.date).toLocaleDateString()}</span>
                          <span className="event-time">⏰ {event.time}</span>
                        </div>
                        <div className="event-location">
                          📍 {event.venue || event.location || 'TBD'}
                        </div>
                        <div className="event-organizer">
                          👤 {event.organizer?.name || 'Unknown'}
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}

                      <div className="event-footer">
                        <div className="attendee-info">
                          <span className="attendee-count">
                            {event.attendees?.length || 0} registered
                          </span>
                        </div>

                        <div className="event-actions">
                          {event.attendees?.includes(user?.id) ? (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => unregisterFromEvent(event._id)}
                            >
                              Unregister
                            </button>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => registerForEvent(event._id)}
                            >
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'my-events' && (
          <div className="my-events-section">
            <h2>My Events</h2>
            <div className="events-stats">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Total Applied</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <h3>No Events Yet</h3>
              <p>You haven't registered for any events yet.</p>
              <p>Go to the Events tab to find and register for exciting events!</p>
            </div>
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="clubs-section">
            <h2>Campus Clubs</h2>
            <div className="clubs-stats">
              <div className="stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Active Clubs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">150</span>
                <span className="stat-label">Total Members</span>
              </div>
            </div>
            
            <div className="clubs-grid">
              <div className="club-card">
                <h3>Tech Innovation Club</h3>
                <p>Exploring cutting-edge technology and innovation</p>
                <div className="club-details">
                  <span>👥 25 members</span>
                  <span>📅 5 events</span>
                </div>
                <button className="btn btn-primary btn-sm">Join Club</button>
              </div>
              
              <div className="club-card">
                <h3>Cultural Society</h3>
                <p>Celebrating arts, culture, and traditions</p>
                <div className="club-details">
                  <span>👥 40 members</span>
                  <span>📅 8 events</span>
                </div>
                <button className="btn btn-primary btn-sm">Join Club</button>
              </div>
              
              <div className="club-card">
                <h3>Sports Club</h3>
                <p>Promoting fitness and competitive sports</p>
                <div className="club-details">
                  <span>👥 35 members</span>
                  <span>📅 12 events</span>
                </div>
                <button className="btn btn-primary btn-sm">Join Club</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>User Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="profile-info">
                  <h3>{user?.name}</h3>
                  <p>{user?.email}</p>
                  <span className="user-type-badge">{user?.userType}</span>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="detail-row">
                  <strong>Department:</strong> {user?.department}
                </div>
                <div className="detail-row">
                  <strong>Year:</strong> {user?.year}
                </div>
                <div className="detail-row">
                  <strong>Section:</strong> {user?.section}
                </div>
                <div className="detail-row">
                  <strong>Phone:</strong> {user?.phone || 'Not provided'}
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Events Registered</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Clubs Joined</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Events Completed</span>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="btn btn-primary">Edit Profile</button>
                <button className="btn btn-danger" onClick={logout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddEventModal 
          onClose={() => setIsModalOpen(false)}
          onAddEvent={addEvent}
        />
      )}
    </div>
  );
};

// Main App Component with Auth
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show organizer dashboard if user is organizer and club is not verified
  if (user?.userType === 'organizer' && !user?.isClubVerified) {
    return <OrganizerDashboard />;
  }

  // Show main dashboard for students and verified organizers
  return <StudentDashboard />;
};

export default App;