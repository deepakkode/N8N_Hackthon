import React from 'react';

const EventCard = ({ event, currentUser, onDelete, onRegister, onUnregister }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const isRegistered = event.attendees?.includes(currentUser?.id);
  const attendeeCount = event.attendees?.length || 0;

  return (
    <div className="event-card">
      <div className="event-header">
        <span className="category-badge">
          {event.category}
        </span>
      </div>
      
      <h3 className="event-title">{event.title || event.name}</h3>
      
      <div className="event-details">
        <div className="event-datetime">
          <span className="event-date">{formatDate(event.date)}</span>
          <span className="event-time">{formatTime(event.time)}</span>
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
        <div className="attendee-info">
          <span className="attendee-count">
            {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
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
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;