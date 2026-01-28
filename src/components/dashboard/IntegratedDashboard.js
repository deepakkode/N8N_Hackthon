import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const IntegratedDashboard = ({ events, user }) => {
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const userRegisteredEvents = events.filter(event => 
    event.attendees && event.attendees.includes(user?._id)
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="integrated-dashboard">
      {/* Main Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Events</h3>
            <span className="stat-number">{events.length}</span>
            <p className="stat-subtitle">Available events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>This Week</h3>
            <span className="stat-number">{thisWeekEvents.length}</span>
            <p className="stat-subtitle">Events this week</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>My Events</h3>
            <span className="stat-number">{profileStats?.totalEventsRegistered || 0}</span>
            <p className="stat-subtitle">Events registered</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L10.5 13.5L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <span className="stat-number">{profileStats?.totalEventsWon || 0}</span>
            <p className="stat-subtitle">Events completed</p>
          </div>
        </div>
      </div>

      {/* Quick Profile Summary */}
      <div className="profile-summary-card">
        <div className="profile-summary-header">
          <img 
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=80&background=1e293b&color=ffffff`}
            alt="Profile"
            className="profile-summary-avatar"
          />
          <div className="profile-summary-info">
            <h3>{user?.name}</h3>
            <p>{user?.department} • Year {user?.year} • Section {user?.section}</p>
            <div className="profile-summary-stats">
              <span className="summary-stat">
                <strong>{profileStats?.totalEventsRegistered || 0}</strong> Events
              </span>
              <span className="summary-stat">
                <strong>{profileStats?.totalFavoriteClubs || 0}</strong> Clubs
              </span>
            </div>
          </div>
        </div>
        
        {profileStats?.mostActiveMonth && (
          <div className="profile-summary-highlight">
            <div className="highlight-item">
              <div className="highlight-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21L9 18L15 21L21 18V6L15 9L9 6L3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <strong>Most Active:</strong>
                <p>{profileStats.mostActiveMonth}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {userRegisteredEvents.slice(0, 3).map((event, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="3" x2="14" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="21" x2="10" y2="14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="activity-content">
                <p><strong>Registered for:</strong> {event.title}</p>
                <small>{new Date(event.date).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {userRegisteredEvents.length === 0 && (
            <div className="activity-empty">
              <p>No recent activity. Start by registering for events!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegratedDashboard;