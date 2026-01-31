import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { API_BASE_URL } from './config/api';
import AuthPage from './components/auth/AuthPage';
import OrganizerDashboard from './components/dashboard/OrganizerDashboard';
import Header from './components/dashboard/Header';
import AddEventModal from './components/events/AddEventModal';
import DiscoverPage from './components/discover/DiscoverPage';
import MyEventsPage from './components/events/MyEventsPage';
import ClubsPage from './components/clubs/ClubsPage';
import ProfilePage from './components/profile/ProfilePage';
import EventCard from './components/events/EventCard';

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
      const response = await axios.get(`${API_BASE_URL}/events/${event.id}/applications`, {
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
        `${API_BASE_URL}/events/${selectedEvent.id}/applications/${applicationId}`,
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
          <div className="no-events-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>No Events Created Yet</h3>
          <p>You haven't created any events yet.</p>
          <p>Click the "Add Event" button to create your first event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {myEvents.map(event => (
            <div key={event.id} className="my-event-card-wrapper">
              <EventCard
                event={event}
                currentUser={user}
                onRegister={() => {}}
                onUnregister={() => {}}
              />
              
              <div className="organizer-actions">
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
                    <div key={application.id} className="application-card">
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

// Main Dashboard Component for Students
const StudentDashboard = ({ hideHeader = false, parentActiveTab = null, onParentTabChange = null }) => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [internalActiveTab, setInternalActiveTab] = useState('events'); // events, clubs, profile

  const { user, logout } = useAuth();

  // Use parent tab state if provided, otherwise use internal state
  const activeTab = parentActiveTab || internalActiveTab;
  const setActiveTab = onParentTabChange || setInternalActiveTab;

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
            <div className="no-events-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Events Yet</h3>
            <p>You haven't registered for any events yet.</p>
            <p>Go to the Events tab to find and register for exciting events!</p>
          </div>
        ) : (
          <div className="events-grid">
            {myEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={user}
                onRegister={() => {}}
                onUnregister={() => {}}
              />
            ))}
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

  // Fetch clubs from API
  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available, skipping clubs fetch');
        setClubs([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched clubs:', response.data);
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    // Only fetch events if user is authenticated
    if (user && user.isEmailVerified) {
      fetchEvents();
      fetchClubs();
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
      console.log('Event created successfully:', createdEvent.id);

      // If there's a custom registration form, update it
      if (newEvent.registrationForm && newEvent.registrationForm.fields.length > 3) {
        try {
          console.log('Updating registration form...');
          await axios.put(`${API_BASE_URL}/events/${createdEvent.id}/form`, {
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
        
        const paymentResponse = await axios.put(`${API_BASE_URL}/events/${createdEvent.id}/payment`, paymentData, {
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
      setEvents(prev => prev.filter(event => event.id !== eventId));
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
      {!hideHeader && (
        <Header 
          user={user}
          onAddEvent={() => setIsModalOpen(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      
      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        
        {activeTab === 'events' && (
          <DiscoverPage 
            events={events}
            clubs={clubs}
            currentUser={user}
            onRegisterEvent={registerForEvent}
            onUnregisterEvent={unregisterFromEvent}
          />
        )}

        {activeTab === 'my-events' && (
          <MyEventsPage user={user} userType={user?.userType} />
        )}

        {activeTab === 'clubs' && (
          <ClubsPage user={user} />
        )}

        {activeTab === 'profile' && (
          <ProfilePage />
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
  const [activeTab, setActiveTab] = useState('events'); // Start with 'events' instead of 'dashboard'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available, skipping events fetch');
        setEvents([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched events:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Fetch clubs from API
  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available, skipping clubs fetch');
        setClubs([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched clubs:', response.data);
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Register for event function
  const registerForEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to register for events');
        return;
      }

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

  // Unregister from event function
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

  // Fetch data when user is authenticated
  React.useEffect(() => {
    if (user && user.isEmailVerified) {
      fetchEvents();
      fetchClubs();
    }
  }, [user]);

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
    // If organizer is not verified, show only the dashboard
    if (!user?.isClubVerified) {
      return (
        <>
          <Header 
            user={user}
            activeTab="events"
            onTabChange={() => {}}
            hideNavigation={true}
          />
          <OrganizerDashboard user={user} />
        </>
      );
    }

    // If organizer is verified, show full navigation
    return (
      <>
        <Header 
          user={user}
          onAddEvent={() => setIsModalOpen(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === 'events' ? (
          <DiscoverPage 
            events={events}
            clubs={clubs}
            currentUser={user}
            onRegisterEvent={registerForEvent}
            onUnregisterEvent={unregisterFromEvent}
          />
        ) : activeTab === 'my-events' ? (
          <MyEventsPage user={user} />
        ) : activeTab === 'clubs' ? (
          <ClubsPage user={user} />
        ) : activeTab === 'profile' ? (
          <ProfilePage />
        ) : null}
        
        {isModalOpen && (
          <AddEventModal 
            onClose={() => setIsModalOpen(false)}
            onAddEvent={() => {
              setIsModalOpen(false);
              // Refresh events if we're on the events tab
              if (activeTab === 'events') {
                window.location.reload(); // Simple refresh for now
              }
            }}
          />
        )}
      </>
    );
  }

  // Show main dashboard for students
  return <StudentDashboard />;
};

export default App;