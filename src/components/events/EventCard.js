import React from 'react';

const EventCard = ({ event, currentUser, onDelete, onRegister, onUnregister }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: '#3b82f6',
      sports: '#ef4444',
      cultural: '#8b5cf6',
      workshop: '#f59e0b',
      seminar: '#10b981'
    };
    return colors[category] || '#6b7280';
  };

  const canDelete = currentUser?.userType === 'organizer' && 
                   currentUser?.isClubVerified && 
                   event.organizer?._id === currentUser?.id;
  
  const isRegistered = event.attendees?.includes(currentUser?.id);
  const attendeeCount = event.attendees?.length || 0;
  const maxAttendees = event.maxAttendees;

  return (
    <div className="event-card">
      <div className="event-header">
        <span 
          className="category-badge"
          style={{ backgroundColor: getCategoryColor(event.category) }}
        >
          {event.category}
        </span>
        {canDelete && (
          <button 
            className="delete-btn"
            onClick={() => onDelete(event._id)}
            aria-label="Delete event"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <h3 className="event-title">{event.title}</h3>
      
      <div className="event-details">
        <div className="event-datetime">
          <span className="event-date">{formatDate(event.date)}</span>
          <span className="event-time">{formatTime(event.time)}</span>
        </div>
        <div className="event-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {event.venue || event.location || 'TBD'}
        </div>
        <div className="event-organizer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 4.17157 16.1716C3.42143 16.9217 3 17.9391 3 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {event.organizer?.name || 'Unknown'}
        </div>
      </div>
      
      {event.description && (
        <p className="event-description">{event.description}</p>
      )}

      <div className="event-footer">
        <div className="attendee-info">
          <span className="attendee-count">
            {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
            {maxAttendees && ` / ${maxAttendees} max`}
          </span>
        </div>

        <div className="event-actions">
          {isRegistered ? (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onUnregister(event._id)}
            >
              Unregister
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onRegister(event._id)}
              disabled={maxAttendees && attendeeCount >= maxAttendees}
            >
              {maxAttendees && attendeeCount >= maxAttendees ? 'Full' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;