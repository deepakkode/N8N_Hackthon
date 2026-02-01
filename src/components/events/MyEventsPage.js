import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import EventCard from './EventCard';
import './MyEventsPage.css';

// QR Code generation utility
const generateQRCode = (data) => {
  const qrData = JSON.stringify(data);
  // Using a simple QR code service - in production, you might want to use a proper QR library
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
};

const MyEventsPage = ({ user }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Add a refresh function that can be called manually
  const refreshEvents = () => {
    setLoading(true);
    fetchMyEvents();
  };

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user?.userType === 'organizer' 
        ? `${API_BASE_URL}/events/organizer/my-events`
        : `${API_BASE_URL}/events/my-events`;
        
      console.log('MyEventsPage - Fetching from:', endpoint);
      console.log('MyEventsPage - User type:', user?.userType);
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('MyEventsPage - Received data:', response.data);
      console.log('MyEventsPage - Number of events:', response.data?.length || 0);
      
      setMyEvents(response.data);
    } catch (error) {
      console.error('Error fetching my events:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    console.log('MyEventsPage - Filtering events. Total events:', myEvents.length);
    console.log('MyEventsPage - Active filter:', activeFilter);
    console.log('MyEventsPage - User type:', user?.userType);
    
    let filtered = myEvents.filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    console.log('MyEventsPage - After search filter:', filtered.length);

    if (user?.userType === 'student') {
      // Log registration statuses for debugging
      myEvents.forEach(event => {
        console.log(`Event: ${event.name}, Registration Status: ${event.userRegistration?.registrationStatus}`);
      });
      
      switch (activeFilter) {
        case 'registered':
          const registered = filtered.filter(e => e.userRegistration?.registrationStatus === 'approved');
          console.log('MyEventsPage - Registered events:', registered.length);
          return registered;
        case 'pending':
          const pending = filtered.filter(e => e.userRegistration?.registrationStatus === 'pending');
          console.log('MyEventsPage - Pending events:', pending.length);
          return pending;
        case 'rejected':
          const rejected = filtered.filter(e => e.userRegistration?.registrationStatus === 'rejected');
          console.log('MyEventsPage - Rejected events:', rejected.length);
          return rejected;
        default:
          console.log('MyEventsPage - All events (default):', filtered.length);
          return filtered;
      }
    } else {
      switch (activeFilter) {
        case 'published':
          return filtered.filter(e => e.isPublished);
        case 'draft':
          return filtered.filter(e => !e.isPublished);
        case 'upcoming':
          return filtered.filter(e => new Date(e.date) > new Date());
        default:
          return filtered;
      }
    }
  };

  const showQRCode = (event) => {
    setSelectedEventForQR(event);
    setShowQRModal(true);
  };

  const generateEventQRData = (event) => {
    return {
      eventId: event.id,
      userId: user.id,
      registrationId: event.userRegistration?.id || event.registrationId,
      studentName: user.name,
      eventName: event.name,
      timestamp: Date.now()
    };
  };

  const getStats = () => {
    if (user?.userType === 'student') {
      const registered = myEvents.filter(e => e.userRegistration?.registrationStatus === 'approved').length;
      const pending = myEvents.filter(e => e.userRegistration?.registrationStatus === 'pending').length;
      const rejected = myEvents.filter(e => e.userRegistration?.registrationStatus === 'rejected').length;
      return { total: myEvents.length, registered, pending, rejected };
    } else {
      const published = myEvents.filter(e => e.isPublished).length;
      const draft = myEvents.filter(e => !e.isPublished).length;
      const totalApplications = myEvents.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
      return { total: myEvents.length, published, draft, totalApplications };
    }
  };

  const handleViewApplications = async (event) => {
    // Implementation for viewing applications (organizer only)
    console.log('View applications for:', event.name);
  };

  if (loading) {
    return (
      <div className="my-events-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredEvents = getFilteredEvents();

  return (
    <div className="my-events-page">
      {/* Hero Section */}
      <div className="my-events-hero">
        <div className="hero-content">
          <div className="hero-header">
            <div className="hero-text">
              <h1>{user?.userType === 'organizer' ? 'My Organized Events' : 'My Events'}</h1>
              <p>
                {user?.userType === 'organizer' 
                  ? 'Manage your events and track applications'
                  : 'Track your event registrations and status'
                }
              </p>
            </div>
            <button 
              className="refresh-btn"
              onClick={refreshEvents}
              disabled={loading}
              title="Refresh events"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.50196 19.9553 6.12132 18.364" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 16V12H7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Search your events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Events</span>
            </div>
          </div>
          
          {user?.userType === 'student' ? (
            <>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.registered}</span>
                  <span className="stat-label">Registered</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.published}</span>
                  <span className="stat-label">Published</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalApplications}</span>
                  <span className="stat-label">Applications</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Filter Events</label>
            <div className="filter-pills">
              <button
                className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Events
              </button>
              
              {user?.userType === 'student' ? (
                <>
                  <button
                    className={`filter-pill ${activeFilter === 'registered' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('registered')}
                  >
                    Registered
                  </button>
                  <button
                    className={`filter-pill ${activeFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('pending')}
                  >
                    Pending
                  </button>
                  <button
                    className={`filter-pill ${activeFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('rejected')}
                  >
                    Rejected
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`filter-pill ${activeFilter === 'published' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('published')}
                  >
                    Published
                  </button>
                  <button
                    className={`filter-pill ${activeFilter === 'draft' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('draft')}
                  >
                    Draft
                  </button>
                  <button
                    className={`filter-pill ${activeFilter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="content-section">
        {filteredEvents.length === 0 ? (
          <div className="no-content">
            <div className="no-content-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No events found</h3>
            <p>
              {user?.userType === 'organizer' 
                ? "You haven't created any events yet. Start by creating your first event!"
                : "You haven't registered for any events yet. Check out the Discover page to find exciting events!"
              }
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id || event._id} className="my-event-card-wrapper">
                <EventCard
                  event={event}
                  currentUser={user}
                  onRegister={() => {}}
                  onUnregister={() => {}}
                />
                
                {user?.userType === 'student' && event.userRegistration?.registrationStatus === 'approved' && (
                  <div className="student-actions">
                    <button 
                      className="btn btn-primary btn-sm qr-btn"
                      onClick={() => showQRCode(event)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <rect x="7" y="7" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="7" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                        <rect x="7" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2"/>
                        <line x1="14" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                        <line x1="14" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="14" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Show QR Code
                    </button>
                    {event.userRegistration?.attended && (
                      <div className="attendance-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Attended
                      </div>
                    )}
                  </div>
                )}
                
                {user?.userType === 'organizer' && (
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedEventForQR && (
        <div className="modal-overlay">
          <div className="qr-modal">
            <div className="qr-modal-header">
              <h3>Your Attendance QR Code</h3>
              <button 
                className="close-btn"
                onClick={() => setShowQRModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="qr-modal-content">
              <div className="event-info">
                <h4>{selectedEventForQR.name}</h4>
                <p>{new Date(selectedEventForQR.date).toLocaleDateString()} at {selectedEventForQR.time}</p>
                <p>{selectedEventForQR.venue}</p>
              </div>
              
              <div className="qr-code-container">
                <img 
                  src={generateQRCode(generateEventQRData(selectedEventForQR))}
                  alt="Attendance QR Code"
                  className="qr-code-image"
                />
                <p className="qr-instructions">
                  Show this QR code to the event organizer for attendance marking
                </p>
              </div>
              
              <div className="qr-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const qrData = JSON.stringify(generateEventQRData(selectedEventForQR));
                    navigator.clipboard.writeText(qrData);
                    alert('QR data copied to clipboard!');
                  }}
                >
                  Copy QR Data
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    const qrUrl = generateQRCode(generateEventQRData(selectedEventForQR));
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.download = `${selectedEventForQR.name}_QR.png`;
                    link.click();
                  }}
                >
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;