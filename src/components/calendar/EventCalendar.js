import React, { useState, useEffect } from 'react';
import './EventCalendar.css';

const EventCalendar = ({ events = [], user, onEventClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [activeFilters, setActiveFilters] = useState(['all']);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    filterEvents();
  }, [events, activeFilters]);

  const filterEvents = () => {
    if (activeFilters.includes('all')) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => {
        if (activeFilters.includes('my-events') && user?.userType === 'student') {
          return event.userRegistration?.registrationStatus === 'approved';
        }
        if (activeFilters.includes('my-organized') && user?.userType === 'organizer') {
          return event.organizerId === user.id;
        }
        if (activeFilters.includes('tech')) return event.category === 'technical';
        if (activeFilters.includes('cultural')) return event.category === 'cultural';
        if (activeFilters.includes('sports')) return event.category === 'sports';
        return true;
      });
      setFilteredEvents(filtered);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (event) => {
    if (user?.userType === 'organizer' && event.organizerId === user.id) {
      return '#667eea'; // Organizer's events
    }
    if (event.userRegistration?.registrationStatus === 'approved') {
      return '#10b981'; // Registered events
    }
    if (event.userRegistration?.registrationStatus === 'pending') {
      return '#f59e0b'; // Pending events
    }
    
    // Category colors
    switch (event.category) {
      case 'technical': return '#3b82f6';
      case 'cultural': return '#ec4899';
      case 'sports': return '#10b981';
      case 'workshop': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, getEventsForDate(date));
    }
  };

  const handleFilterChange = (filter) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      const newFilters = activeFilters.includes('all') 
        ? [filter] 
        : activeFilters.includes(filter)
          ? activeFilters.filter(f => f !== filter)
          : [...activeFilters.filter(f => f !== 'all'), filter];
      
      setActiveFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="event-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
        </div>
        
        <div className="calendar-controls">
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Event Filters */}
      <div className="calendar-filters">
        <div className="filter-pills">
          <button 
            className={`filter-pill ${activeFilters.includes('all') ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Events
          </button>
          
          {user?.userType === 'student' && (
            <button 
              className={`filter-pill ${activeFilters.includes('my-events') ? 'active' : ''}`}
              onClick={() => handleFilterChange('my-events')}
            >
              My Events
            </button>
          )}
          
          {user?.userType === 'organizer' && (
            <button 
              className={`filter-pill ${activeFilters.includes('my-organized') ? 'active' : ''}`}
              onClick={() => handleFilterChange('my-organized')}
            >
              My Organized
            </button>
          )}
          
          <button 
            className={`filter-pill tech ${activeFilters.includes('tech') ? 'active' : ''}`}
            onClick={() => handleFilterChange('tech')}
          >
            <span className="filter-dot tech"></span>
            Technical
          </button>
          
          <button 
            className={`filter-pill cultural ${activeFilters.includes('cultural') ? 'active' : ''}`}
            onClick={() => handleFilterChange('cultural')}
          >
            <span className="filter-dot cultural"></span>
            Cultural
          </button>
          
          <button 
            className={`filter-pill sports ${activeFilters.includes('sports') ? 'active' : ''}`}
            onClick={() => handleFilterChange('sports')}
          >
            <span className="filter-dot sports"></span>
            Sports
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week day headers */}
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {days.map((date, index) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date && (
                  <>
                    <span className="day-number">{date.getDate()}</span>
                    
                    {dayEvents.length > 0 && (
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="event-dot"
                            style={{ backgroundColor: getEventTypeColor(event) }}
                            title={event.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEventClick) onEventClick(event);
                            }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="more-events">
                            +{dayEvents.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="selected-date-events">
          <h3>
            Events on {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="date-events-list">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="no-events">No events scheduled for this date</p>
            ) : (
              getEventsForDate(selectedDate).map((event, index) => (
                <div 
                  key={index} 
                  className="date-event-item"
                  onClick={() => onEventClick && onEventClick(event)}
                >
                  <div 
                    className="event-color-bar"
                    style={{ backgroundColor: getEventTypeColor(event) }}
                  />
                  <div className="event-details">
                    <h4>{event.name}</h4>
                    <p className="event-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {event.time}
                    </p>
                    <p className="event-venue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {event.venue}
                    </p>
                    {event.userRegistration && (
                      <span className={`registration-status ${event.userRegistration.registrationStatus}`}>
                        {event.userRegistration.registrationStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#667eea' }}></div>
            <span>My Organized Events</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
            <span>Registered Events</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Pending Registration</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#6b7280' }}></div>
            <span>Available Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;