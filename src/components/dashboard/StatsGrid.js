import React from 'react';

const StatsGrid = ({ events }) => {
  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= oneWeekFromNow;
  });

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Events</h3>
        <span className="stat-number">{events.length}</span>
      </div>
      <div className="stat-card">
        <h3>This Week</h3>
        <span className="stat-number">{thisWeekEvents.length}</span>
      </div>
      <div className="stat-card">
        <h3>Upcoming</h3>
        <span className="stat-number">{upcomingEvents.length}</span>
      </div>
    </div>
  );
};

export default StatsGrid;