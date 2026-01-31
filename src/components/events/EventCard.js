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
    if (!timeString) return 'TBD';
    return timeString;
  };

  // Check registration status from userRegistration object
  const userRegistration = event.userRegistration;
  const isRegistered = userRegistration?.registrationStatus === 'approved';
  const isPending = userRegistration?.registrationStatus === 'pending';
  const isRejected = userRegistration?.registrationStatus === 'rejected';
  const attendeeCount = event.attendees?.length || event.registrations?.length || 0;

  const handleRegister = () => {
    if (onRegister) {
      onRegister(event.id || event._id);
    }
  };

  const handleUnregister = () => {
    if (onUnregister) {
      onUnregister(event.id || event._id);
    }
  };

  return (
    <div className="event-card">
      {event.poster && (
        <div className="event-poster">
          <img src={event.poster} alt={event.title || event.name} />
        </div>
      )}
      
      <div className="event-content">
        <div className="event-header">
          <span className="category-badge">
            {event.category || 'General'}
          </span>
          {userRegistration && (
            <span className={`status-badge ${userRegistration.registrationStatus}`}>
              {userRegistration.registrationStatus === 'pending' && 'Pending'}
              {userRegistration.registrationStatus === 'approved' && 'Registered'}
              {userRegistration.registrationStatus === 'rejected' && 'Rejected'}
            </span>
          )}
        </div>
        
        <h3 className="event-title">{event.title || event.name}</h3>
        
        <div className="event-details">
          <div className="event-datetime">
            <div className="event-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="event-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{formatTime(event.time)}</span>
            </div>
          </div>
          
          <div className="event-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{event.venue || event.location || 'TBD'}</span>
          </div>
          
          <div className="event-organizer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{event.organizer?.name || 'Unknown Organizer'}</span>
          </div>

          {event.maxParticipants && (
            <div className="event-capacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 16.7909 14.2091 15 12 15C9.79086 15 8 16.7909 8 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Capacity: {attendeeCount}/{event.maxParticipants}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}

        <div className="event-footer">
          <div className="attendee-info">
            <span className="attendee-count">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>

          <div className="event-actions">
            {!userRegistration ? (
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleRegister}
                disabled={event.maxParticipants && attendeeCount >= event.maxParticipants}
              >
                {event.maxParticipants && attendeeCount >= event.maxParticipants ? 'Full' : 'Register'}
              </button>
            ) : isPending ? (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleUnregister}
              >
                Cancel Registration
              </button>
            ) : isRegistered ? (
              <span className="registration-confirmed">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                You're registered!
              </span>
            ) : isRejected ? (
              <span className="registration-rejected">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Registration declined
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;