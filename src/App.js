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
          <div className="simple-page">
            <h2>Events Dashboard</h2>
            <p>Total Events: {events.length}</p>
            <div className="simple-events-list">
              {events.map(event => (
                <div key={event._id} className="simple-event-card">
                  <h3>{event.title || event.name}</h3>
                  <p>{event.description}</p>
                  <p>📅 {event.date} ⏰ {event.time}</p>
                  <p>📍 {event.venue || event.location}</p>
                  <button onClick={() => registerForEvent(event._id)}>
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-events' && (
          <div className="simple-page">
            <h2>My Events</h2>
            <p>This page is temporarily simplified to fix React errors.</p>
            <p>User: {user?.name}</p>
            <p>Type: {user?.userType}</p>
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="simple-page">
            <h2>Clubs</h2>
            <p>This page is temporarily simplified to fix React errors.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="simple-page">
            <h2>Profile</h2>
            <p>This page is temporarily simplified to fix React errors.</p>
            <p>User: {user?.name}</p>
            <p>Email: {user?.email}</p>
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