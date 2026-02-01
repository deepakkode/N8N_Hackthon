import React, { useState, useEffect } from 'react';
import EventCard from '../events/EventCard';
import ClubCard from '../clubs/ClubCard';
import './DiscoverPage.css';

const DiscoverPage = ({ events = [], clubs = [], currentUser, onRegisterEvent, onUnregisterEvent, clubFilter = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('events');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [activeClubFilter, setActiveClubFilter] = useState(clubFilter);

  // Update club filter when prop changes
  useEffect(() => {
    if (clubFilter) {
      setActiveClubFilter(clubFilter);
      setViewMode('events'); // Switch to events view when filtering by club
    }
  }, [clubFilter]);

  // Use real data only - no demo fallbacks
  const displayEvents = events || [];
  const displayClubs = clubs || [];

  console.log('DiscoverPage - Real events:', events.length, 'Real clubs:', clubs.length);

  const categories = ['all', 'technical', 'cultural', 'sports', 'academic', 'social', 'workshop'];
  const filters = ['all', 'upcoming', 'today', 'this-week', 'trending'];

  useEffect(() => {
    filterContent();
  }, [displayEvents, displayClubs, searchTerm, selectedCategory, selectedFilter, viewMode, activeClubFilter]);

  const filterContent = () => {
    if (viewMode === 'events') {
      let filtered = displayEvents.filter(event => {
        const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                              event.category?.toLowerCase() === selectedCategory;
        
        // Filter by club if specified
        const matchesClub = !activeClubFilter || 
                          event.organizerId === activeClubFilter.id ||
                          event.organizer?.id === activeClubFilter.id ||
                          event.organizer?._id === activeClubFilter.id;
        
        // Debug logging for club filtering
        if (activeClubFilter) {
          console.log('Filtering event:', event.title, {
            eventOrganizerId: event.organizerId,
            eventOrganizerIdFromObj: event.organizer?.id,
            eventOrganizerIdFromObj2: event.organizer?._id,
            clubFilterId: activeClubFilter.id,
            matchesClub
          });
        }
        
        return matchesSearch && matchesCategory && matchesClub;
      });

      // Apply time-based filters
      if (selectedFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.date) > new Date());
      } else if (selectedFilter === 'today') {
        const today = new Date().toDateString();
        filtered = filtered.filter(event => new Date(event.date).toDateString() === today);
      } else if (selectedFilter === 'this-week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filtered.filter(event => 
          new Date(event.date) >= new Date() && new Date(event.date) <= weekFromNow
        );
      } else if (selectedFilter === 'trending') {
        filtered = filtered.sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0));
      }

      setFilteredEvents(filtered);
    } else {
      let filtered = displayClubs.filter(club => {
        const matchesSearch = club.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            club.clubDescription?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
      setFilteredClubs(filtered);
    }
  };

  const getTrendingEvents = () => {
    return displayEvents
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))
      .slice(0, 3);
  };

  const getUpcomingEvents = () => {
    return displayEvents
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  };

  const getCategoryStats = () => {
    const stats = {};
    displayEvents.forEach(event => {
      const category = event.category || 'other';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  };

  const getUpcomingEventsCount = () => {
    return displayEvents.filter(event => new Date(event.date) > new Date()).length;
  };

  return (
    <div className="discover-page">
      {/* Hero Section */}
      <div className="discover-hero">
        <div className="hero-content">
          <h1>Discover Amazing Events</h1>
          <p>Find events and clubs that match your interests</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Search events, clubs, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          {/* Club Filter Indicator */}
          {activeClubFilter && (
            <div className="club-filter-indicator">
              <div className="filter-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21H21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 9V21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9V21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Showing events from: {activeClubFilter.name}</span>
                <button 
                  onClick={() => setActiveClubFilter(null)}
                  className="clear-filter-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Stats Cards */}
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{displayEvents.length}</span>
              <span className="stat-label">Total Events</span>
            </div>
          </div>
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
              <span className="stat-number">{displayClubs.length}</span>
              <span className="stat-label">Active Clubs</span>
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
              <span className="stat-number">{getUpcomingEventsCount()}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="discover-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${viewMode === 'events' ? 'active' : ''}`}
            onClick={() => setViewMode('events')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Events
          </button>
          <button 
            className={`nav-tab ${viewMode === 'clubs' ? 'active' : ''}`}
            onClick={() => setViewMode('clubs')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Clubs
          </button>
        </div>
      </div>

      {/* Trending Section */}
      {viewMode === 'events' && getTrendingEvents().length > 0 && (
        <div className="trending-section">
          <div className="section-header">
            <h2>Trending Events</h2>
            <p>Most popular events right now</p>
          </div>
          <div className="trending-events">
            {getTrendingEvents().map((event, index) => (
              <div key={event._id} className="trending-event-card">
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-content">
                  <h4>{event.title}</h4>
                  <p>{event.description?.substring(0, 100)}...</p>
                  <div className="trending-meta">
                    <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                    <span>Attendees: {event.attendees?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          {viewMode === 'events' && (
            <>
              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <div className="category-pills">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div className="filter-group">
                <label>Time</label>
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-section">
        {viewMode === 'events' ? (
          <div className="events-grid stagger-children">
            {filteredEvents.length === 0 ? (
              <div className="no-content">
                <div className="no-content-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>No events found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <EventCard
                  key={event.id || event._id || `event-${Math.random()}`}
                  event={event}
                  currentUser={currentUser}
                  onRegister={onRegisterEvent}
                  onUnregister={onUnregisterEvent}
                />
              ))
            )}
          </div>
        ) : (
          <div className="clubs-grid stagger-children">
            {filteredClubs.length === 0 ? (
              <div className="no-content">
                <div className="no-content-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>No clubs found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              filteredClubs.map(club => (
                <ClubCard
                  key={club._id}
                  club={club}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;