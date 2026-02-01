import React from 'react';

const ClubCard = ({ club, currentUser, onViewEvents }) => {
  const handleViewEvents = () => {
    if (onViewEvents) {
      onViewEvents(club._id || club.id);
    }
  };

  // Handle both API data structure and demo data structure
  const clubName = club.clubName || club.name;
  const clubDescription = club.clubDescription || club.description;
  const clubLogo = club.clubLogo || club.logo;

  return (
    <div className="club-card">
      <div className="club-header">
        {clubLogo ? (
          <img 
            src={clubLogo} 
            alt={`${clubName} logo`}
            className="club-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="club-logo-placeholder"
          style={{ display: clubLogo ? 'none' : 'flex' }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="club-content">
        <h3 className="club-name">{clubName}</h3>
        
        <p className="club-description">{clubDescription}</p>
        
        <div className="club-details">
          <div className="club-organizer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 4.17157 16.1716C3.42143 16.9217 3 17.9391 3 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Organizer: {club.organizer?.name}</span>
          </div>
          
          <div className="club-department">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V21L12 17.5L19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{club.organizer?.department}</span>
          </div>
        </div>

        <div className="club-stats">
          <div className="stat-item">
            <span className="stat-number">{club.eventCount || club.totalEvents || 0}</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{club.memberCount || club.totalMembers || 0}</span>
            <span className="stat-label">Members</span>
          </div>
        </div>
      </div>

      <div className="club-actions">
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleViewEvents}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          View Events
        </button>
      </div>
    </div>
  );
};

export default ClubCard;