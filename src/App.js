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

  // Student My Events Component
  const StudentMyEvents = ({ user }) => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/events/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyEvents(response.data);
      } catch (error) {
        console.error('Error fetching my events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return <div className="loading-spinner">Loading your events...</div>;
    }

    const registeredEvents = myEvents.filter(e => e.userRegistration?.registrationStatus === 'approved');
    const pendingEvents = myEvents.filter(e => e.userRegistration?.registrationStatus === 'pending');
    const rejectedEvents = myEvents.filter(e => e.userRegistration?.registrationStatus === 'rejected');

    return (
      <>
        <div className="events-stats">
          <div className="stat-item">
            <span className="stat-number">{myEvents.length}</span>
            <span className="stat-label">Total Applied</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{registeredEvents.length}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pendingEvents.length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        
        {myEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No Events Yet</h3>
            <p>You haven't registered for any events yet.</p>
            <p>Go to the Events tab to find and register for exciting events!</p>
          </div>
        ) : (
          <div className="events-grid">
            {myEvents.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <span className="category-badge" style={{backgroundColor: '#2563eb'}}>
                    {event.category}
                  </span>
                  <span className={`status-badge ${event.userRegistration?.registrationStatus || 'pending'}`}>
                    {event.userRegistration?.registrationStatus || 'pending'}
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
                  <div className="registration-status">
                    {event.userRegistration?.registrationStatus === 'approved' && (
                      <span className="status-message approved">✅ You're registered!</span>
                    )}
                    {event.userRegistration?.registrationStatus === 'pending' && (
                      <span className="status-message pending">⏳ Awaiting approval...</span>
                    )}
                    {event.userRegistration?.registrationStatus === 'rejected' && (
                      <span className="status-message rejected">❌ Registration declined</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // Organizer My Events Component
  const OrganizerMyEvents = ({ user }) => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showApplications, setShowApplications] = useState(false);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
      fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/events/organizer/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyEvents(response.data);
      } catch (error) {
        console.error('Error fetching my events:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleViewApplications = async (event) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/events/${event._id}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data);
        setSelectedEvent(event);
        setShowApplications(true);
      } catch (error) {
        console.error('Error fetching applications:', error);
        alert('Failed to load applications');
      }
    };

    const handleApplicationAction = async (applicationId, action) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `${API_BASE_URL}/events/${selectedEvent._id}/applications/${applicationId}`,
          { registrationStatus: action },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Refresh applications
        handleViewApplications(selectedEvent);
        
        // Refresh events to update counts
        fetchMyEvents();
        
        alert(`Application ${action} successfully!`);
      } catch (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application');
      }
    };

    if (loading) {
      return <div className="loading-spinner">Loading your events...</div>;
    }

    const publishedEvents = myEvents.filter(e => e.isPublished);
    const draftEvents = myEvents.filter(e => !e.isPublished);
    const totalApplications = myEvents.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);

    return (
      <>
        <div className="events-stats">
          <div className="stat-item">
            <span className="stat-number">{myEvents.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{publishedEvents.length}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalApplications}</span>
            <span className="stat-label">Applications</span>
          </div>
        </div>
        
        {myEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No Events Created Yet</h3>
            <p>You haven't created any events yet.</p>
            <p>Click the "Add Event" button to create your first event!</p>
          </div>
        ) : (
          <div className="events-grid">
            {myEvents.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <span className="category-badge" style={{backgroundColor: '#2563eb'}}>
                    {event.category}
                  </span>
                  <span className={`status-badge ${event.isPublished ? 'published' : 'draft'}`}>
                    {event.isPublished ? 'Published' : 'Draft'}
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
                  <div className="event-applications">
                    👥 {event.registrations?.length || 0} applications
                  </div>
                </div>
                
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-footer">
                  <div className="event-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewApplications(event)}
                    >
                      View Applications ({event.registrations?.length || 0})
                    </button>
                    {!event.isPublished && (
                      <button className="btn btn-secondary btn-sm">
                        Publish Event
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applications Modal */}
        {showApplications && selectedEvent && (
          <div className="modal-overlay">
            <div className="applications-modal">
              <div className="applications-header">
                <h2>Applications for {selectedEvent.name}</h2>
                <button className="close-btn" onClick={() => setShowApplications(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="applications-content">
                {applications.length === 0 ? (
                  <div className="no-applications">
                    <h3>No applications yet</h3>
                    <p>No one has applied for this event yet.</p>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map(application => (
                      <div key={application._id} className="application-card">
                        <div className="application-header">
                          <div className="applicant-info">
                            <h4>{application.user?.name || 'Unknown'}</h4>
                            <p>{application.user?.email}</p>
                          </div>
                          <div className="application-status">
                            <span className={`status-badge ${application.registrationStatus}`}>
                              {application.registrationStatus}
                            </span>
                          </div>
                        </div>

                        <div className="application-details">
                          <div className="detail-item">
                            <span className="label">Applied:</span>
                            <span>{new Date(application.registeredAt).toLocaleDateString()}</span>
                          </div>
                          
                          {application.paymentScreenshot && (
                            <div className="detail-item">
                              <span className="label">Payment:</span>
                              <span className={`payment-status ${application.paymentStatus}`}>
                                {application.paymentStatus}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="application-actions">
                          {application.registrationStatus === 'pending' && (
                            <>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleApplicationAction(application._id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleApplicationAction(application._id, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {application.registrationStatus !== 'pending' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleApplicationAction(application._id, 'pending')}
                            >
                              Reset to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

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
      
      console.log('Fetched events:', response.data);
      setEvents(response.data);
      setError('');
      
      // Debug: Also fetch all events to see what's in the database
      try {
        const debugResponse = await axios.get(`${API_BASE_URL}/events/debug`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('All events in database:', debugResponse.data);
      } catch (debugError) {
        console.log('Debug fetch failed:', debugError.message);
      }
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
              <h2>Discover Dashboard</h2>
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
              <h2>Discover Events</h2>
              {events.length === 0 ? (
                <div className="no-events">
                  <p>No events available. {user?.userType === 'organizer' ? 'Create your first event!' : 'Check back later for new events!'}</p>
                </div>
              ) : (
                <div className="events-list">
                  {events.map(event => (
                    <div key={event._id} className="event-card-horizontal">
                      <div className="event-poster-left">
                        {event.poster ? (
                          <img src={event.poster} alt={event.name} />
                        ) : (
                          <div className="no-poster-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="event-details-right">
                        <h3 className="event-title">{event.name}</h3>
                        <p className="event-description">{event.description}</p>
                        <div className="event-meta-info">
                          <span className="event-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="event-venue">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {event.venue}
                          </span>
                          <span className="event-category">{event.category}</span>
                        </div>
                        <div className="event-actions">
                          {!event.userRegistration ? (
                            <button 
                              className="register-btn"
                              onClick={() => registerForEvent(event._id)}
                            >
                              Register
                            </button>
                          ) : (
                            <div className="registration-status">
                              <span className={`status-badge ${event.userRegistration.registrationStatus}`}>
                                {event.userRegistration.registrationStatus === 'pending' && 'Pending Approval'}
                                {event.userRegistration.registrationStatus === 'approved' && 'Registered'}
                                {event.userRegistration.registrationStatus === 'rejected' && 'Registration Rejected'}
                              </span>
                              {event.userRegistration.registrationStatus === 'pending' && (
                                <button 
                                  className="unregister-btn"
                                  onClick={() => unregisterFromEvent(event._id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
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
            <h2>{user?.userType === 'organizer' ? 'My Organized Events' : 'My Events'}</h2>
            
            {user?.userType === 'student' ? (
              <StudentMyEvents user={user} />
            ) : (
              <OrganizerMyEvents user={user} />
            )}
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
          onAddEvent={fetchEvents}
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
  const { isAuthenticated, loading, user, logout } = useAuth();

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

  // Show organizer dashboard if user is organizer
  if (user?.userType === 'organizer') {
    const OrganizerApp = () => {
      const [activeTab, setActiveTab] = useState('events');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [events, setEvents] = useState([]);
      const [loading, setLoading] = useState(true);

      // Fetch events for organizers too
      const fetchOrganizerEvents = async () => {
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
          
          console.log('Fetched events for organizer:', response.data);
          setEvents(response.data);
        } catch (error) {
          console.error('Error fetching events for organizer:', error);
        } finally {
          setLoading(false);
        }
      };

      // Fetch events on component mount
      useEffect(() => {
        if (user && user.isEmailVerified) {
          fetchOrganizerEvents();
        }
      }, [user]);

      return (
        <div className="App">
          <Header 
            user={user} 
            onLogout={logout} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddEvent={() => setIsModalOpen(true)}
          />
          
          <main className="main-content">
            {activeTab === 'events' && (
              <>
                <div className="dashboard-section">
                  <div className="section-header">
                    <h2>Discover Events</h2>
                    <p>Browse all events happening across campus</p>
                  </div>
                </div>

                <div className="events-section">
                  <div className="events-list">
                    {loading ? (
                      <div className="loading">Loading events...</div>
                    ) : events.length === 0 ? (
                      <div className="no-events">
                        <h3>No events available</h3>
                        <p>Check back later for upcoming events!</p>
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event._id} className="event-card-horizontal">
                          <div className="event-poster-left">
                            {event.poster ? (
                              <img src={event.poster} alt={event.name} />
                            ) : (
                              <div className="no-poster-placeholder">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="event-details-right">
                            <h3 className="event-title">{event.name}</h3>
                            <p className="event-description">{event.description}</p>
                            <div className="event-meta-info">
                              <span className="event-date">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="event-venue">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                {event.venue}
                              </span>
                              <span className="event-category">{event.category}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'my-events' && (
              <OrganizerDashboard user={user} />
            )}
            
            {activeTab === 'clubs' && (
              <div className="clubs-section">
                <h2>Clubs</h2>
                <p>Manage your club and view other clubs</p>
                {/* Add clubs management here */}
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="profile-section">
                <h2>Profile</h2>
                <p>Manage your organizer profile</p>
                {/* Add profile management here */}
              </div>
            )}
          </main>

          {isModalOpen && (
            <AddEventModal 
              onClose={() => setIsModalOpen(false)}
              onAddEvent={() => {
                setIsModalOpen(false);
                fetchOrganizerEvents(); // Refresh events after creating
              }}
            />
          )}
        </div>
      );
    };

    return <OrganizerApp />;
  }

  // Show main dashboard for students
  return <StudentDashboard />;
};

export default App;