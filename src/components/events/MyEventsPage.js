import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import EventCard from './EventCard';
import './MyEventsPage.css';

const MyEventsPage = ({ user }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user?.userType === 'organizer' 
        ? `${API_BASE_URL}/events/organizer/my-events`
        : `${API_BASE_URL}/events/my-events`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEvents(response.data);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    let filtered = myEvents.filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (user?.userType === 'student') {
      switch (activeFilter) {
        case 'registered':
          return filtered.filter(e => e.userRegistration?.registrationStatus === 'approved');
        case 'pending':
          return filtered.filter(e => e.userRegistration?.registrationStatus === 'pending');
        case 'rejected':
          return filtered.filter(e => e.userRegistration?.registrationStatus === 'rejected');
        default:
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
          <h1>{user?.userType === 'organizer' ? 'My Organized Events' : 'My Events'}</h1>
          <p>
            {user?.userType === 'organizer' 
              ? 'Manage your events and track applications'
              : 'Track your event registrations and status'
            }
          </p>
          
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
    </div>
  );
};

export default MyEventsPage;