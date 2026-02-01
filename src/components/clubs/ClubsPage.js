import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import ClubCard from './ClubCard';
import CreateClub from './CreateClub';
import EventCard from '../events/EventCard';
import './ClubsPage.css';

const ClubsPage = ({ user }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setClubs([]);
        setError('Please log in to view clubs');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Loaded', response.data?.length || 0, 'clubs from API');
      
      // Only use real API data - no demo data fallback
      setClubs(response.data || []);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching clubs:', error.response?.data?.message || error.message);
      
      // Don't use demo data - show the actual error
      setClubs([]);
      setError(`Failed to load clubs: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredClubs = () => {
    return clubs.filter(club => {
      const clubName = club.clubName || club.name || '';
      const clubDescription = club.clubDescription || club.description || '';
      const organizerDepartment = club.organizer?.department || '';
      
      const matchesSearch = clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clubDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || 
                              organizerDepartment.toLowerCase().includes(selectedDepartment.toLowerCase());
      
      return matchesSearch && matchesDepartment;
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(clubs.map(club => club.organizer?.department).filter(Boolean))];
    return departments;
  };

  const getStats = () => {
    const totalMembers = clubs.reduce((sum, club) => sum + (club.memberCount || 0), 0);
    const totalEvents = clubs.reduce((sum, club) => sum + (club.eventCount || 0), 0);
    const departments = getDepartments().length;
    return { totalClubs: clubs.length, totalMembers, totalEvents, departments };
  };

  const handleViewEvents = async (clubId) => {
    console.log('Loading events for club:', clubId);
    const club = clubs.find(club => (club.id || club._id) === clubId);
    setSelectedClub(club);
    setShowEventsModal(true);
    setEventsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // Try to fetch events for this specific club
      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter events by club organizer
      const clubSpecificEvents = response.data.filter(event => 
        event.organizerId === clubId || 
        event.organizer?.id === clubId ||
        event.organizer?._id === clubId
      );
      
      console.log('Found', clubSpecificEvents.length, 'events for club:', club?.name || club?.clubName);
      setClubEvents(clubSpecificEvents);
    } catch (error) {
      console.error('Error fetching club events:', error);
      setClubEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleClubCreated = () => {
    setShowCreateClub(false);
    fetchClubs();
  };

  if (loading) {
    return (
      <div className="clubs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredClubs = getFilteredClubs();
  const departments = getDepartments();

  return (
    <div className="clubs-page">
      {/* Hero Section */}
      <div className="clubs-hero">
        <div className="hero-content">
          <h1>Campus Clubs</h1>
          <p>Discover and join clubs that match your interests and passions</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Search clubs by name or description..."
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
                <path d="M3 21H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9V21" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9V21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalClubs}</span>
              <span className="stat-label">Active Clubs</span>
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
              <span className="stat-number">{stats.totalMembers}</span>
              <span className="stat-label">Total Members</span>
            </div>
          </div>
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
              <span className="stat-number">{stats.totalEvents}</span>
              <span className="stat-label">Events Hosted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10C3.10457 10 4 10.8954 4 12C4 13.1046 3.10457 14 2 14V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V14C20.8954 14 20 13.1046 20 12C20 10.8954 20.8954 10 22 10Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.departments}</span>
              <span className="stat-label">Departments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {user?.userType === 'organizer' && !user?.isClubVerified && (
        <div className="action-bar">
          <div className="action-container">
            <div className="action-content">
              <h3>Ready to start your own club?</h3>
              <p>Create and manage your own club to organize events and build a community</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateClub(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Club
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Filter by Department</label>
            <div className="department-pills">
              <button
                className={`department-pill ${selectedDepartment === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDepartment('all')}
              >
                All Departments
              </button>
              {departments.map(department => (
                <button
                  key={department}
                  className={`department-pill ${selectedDepartment === department ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment(department)}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="content-section">
        {error && <div className="error-banner">{error}</div>}
        
        {filteredClubs.length === 0 && clubs.length > 0 ? (
          <div className="no-content">
            <div className="no-content-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Clubs found but filtered out</h3>
            <p>
              Found {clubs.length} club(s) in the database but they don't match your current filters.
              {searchTerm && ` Search: "${searchTerm}"`}
              {selectedDepartment !== 'all' && ` Department: "${selectedDepartment}"`}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('all');
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="no-content">
            <div className="no-content-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No clubs found</h3>
            <p>
              {searchTerm || selectedDepartment !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No clubs have been created yet. Be the first to start a club!'
              }
            </p>
          </div>
        ) : (
          <div className="clubs-grid">
            {filteredClubs.map(club => (
              <ClubCard
                key={club._id || club.id}
                club={club}
                currentUser={user}
                onViewEvents={handleViewEvents}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreateClub && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateClub 
              onClose={() => setShowCreateClub(false)}
              onClubCreated={handleClubCreated}
            />
          </div>
        </div>
      )}

      {/* Club Events Modal */}
      {showEventsModal && (
        <div className="modal-overlay">
          <div className="events-modal">
            <div className="modal-header">
              <h2>Events from {selectedClub?.name || selectedClub?.clubName}</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEventsModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {eventsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : clubEvents.length === 0 ? (
                <div className="no-events">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>No events found</h3>
                  <p>This club hasn't organized any events yet.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {clubEvents.map(event => (
                    <EventCard
                      key={event.id || event._id}
                      event={event}
                      currentUser={user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;