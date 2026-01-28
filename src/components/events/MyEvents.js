import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const MyEvents = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('');
    } catch (error) {
      console.error('Error fetching my events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchMyEvents}>Retry</button>
      </div>
    );
  }

  return (
    <div className="my-events">
      <h2>My Events</h2>
      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't registered for any events yet.</p>
          <p>Go to the Events tab to find and register for events!</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div key={event._id} className="event-item">
              <h3>{event.title || event.name}</h3>
              <p>{event.description}</p>
              <div className="event-details">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>📍 {event.venue || event.location}</span>
                <span>👤 {event.organizer?.name}</span>
              </div>
              <div className="event-status">
                <span className={`status ${event.registrationStatus || 'pending'}`}>
                  Status: {event.registrationStatus || 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;