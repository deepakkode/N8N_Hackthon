import React from 'react';
import EventCard from './EventCard';

const EventsSection = ({ events, currentUser, onDeleteEvent, onRegisterEvent, onUnregisterEvent }) => {
  return (
    <div className="events-section">
      <h2>Events</h2>
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found. {currentUser?.userType === 'organizer' && currentUser?.isClubVerified ? 'Add some events to get started!' : 'Check back later for new events!'}</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard 
              key={event._id}
              event={event}
              currentUser={currentUser}
              onDelete={onDeleteEvent}
              onRegister={onRegisterEvent}
              onUnregister={onUnregisterEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsSection;