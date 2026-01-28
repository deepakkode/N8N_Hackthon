import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const MyEvents = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, registered, applied, approved, rejected

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/my-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    switch (filter) {
      case 'registered':
        return events.filter(event => 
          event.userRegistration && event.userRegistration.registrationStatus === 'approved'
        );
      case 'applied':
        return events.filter(event => 
          event.userRegistration && event.userRegistration.registrationStatus === 'pending'
        );
      case 'approved':
        return events.filter(event => 
          event.userRegistration && event.userRegistration.registrationStatus === 'approved'
        );
      case 'rejected':
        return events.filter(event => 
          event.userRegistration && event.userRegistration.registrationStatus === 'rejected'
        );
      default:
        return events;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Registered';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Applied';
      default: return 'Unknown';
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="my-events-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h2>My Events</h2>
        <p>Track your event registrations and applications</p>
      </div>

      <div className="my-events-filters">
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'approved', label: 'Registered' },
            { key: 'applied', label: 'Applied' },
            { key: 'rejected', label: 'Rejected' }
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="count">
                {key === 'all' 
                  ? events.length 
                  : events.filter(event => {
                      if (key === 'applied') return event.userRegistration?.registrationStatus === 'pending';
                      return event.userRegistration?.registrationStatus === key;
                    }).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="my-events-content">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>No events found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't registered for any events yet. Explore the Events tab to find exciting events!"
                : `No ${filter} events found.`
              }
            </p>
          </div>
        ) : (
          <div className="my-events-grid">
            {filteredEvents.map(event => (
              <MyEventCard 
                key={event._id} 
                event={event} 
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getDaysUntilEvent={getDaysUntilEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyEventCard = ({ event, getStatusColor, getStatusText, getDaysUntilEvent }) => {
  const daysUntil = getDaysUntilEvent(event.date);
  const isUpcoming = daysUntil >= 0;
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;
  const status = event.userRegistration?.registrationStatus || 'unknown';

  return (
    <div className={`my-event-card ${isPast ? 'past-event' : ''}`}>
      {event.poster && (
        <div className="event-poster">
          <img src={event.poster} alt={event.name} />
        </div>
      )}
      
      <div className="event-content">
        <div className="event-header">
          <h3>{event.name}</h3>
          <div className="event-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(status) }}
            >
              {getStatusText(status)}
            </span>
          </div>
        </div>

        <div className="event-details">
          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>

          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{event.time}</span>
          </div>

          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{event.venue}</span>
          </div>

          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{event.collegeName}</span>
          </div>
        </div>

        {status === 'approved' && isUpcoming && (
          <div className="event-countdown">
            {isToday ? (
              <div className="countdown-today">
                <span className="countdown-icon">🎉</span>
                <span className="countdown-text">Today is the day!</span>
              </div>
            ) : daysUntil === 1 ? (
              <div className="countdown-tomorrow">
                <span className="countdown-icon">🚀</span>
                <span className="countdown-text">Tomorrow!</span>
              </div>
            ) : daysUntil <= 7 ? (
              <div className="countdown-soon">
                <span className="countdown-icon">⏰</span>
                <span className="countdown-text">{daysUntil} days to go</span>
              </div>
            ) : (
              <div className="countdown-normal">
                <span className="countdown-icon">📅</span>
                <span className="countdown-text">{daysUntil} days to go</span>
              </div>
            )}
          </div>
        )}

        {event.userRegistration?.registeredAt && (
          <div className="registration-info">
            <small>
              Applied on {new Date(event.userRegistration.registeredAt).toLocaleDateString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;