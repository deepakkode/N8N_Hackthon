import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClubCard from './ClubCard';

const ClubsSection = ({ user }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5002/api/clubs');
      setClubs(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setError('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clubs-section">
        <h2>College Clubs</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clubs-section">
      <div className="section-header">
        <h2>College Clubs</h2>
        <p className="section-subtitle">Discover clubs and their events</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {clubs.length === 0 ? (
        <div className="no-clubs">
          <div className="no-clubs-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15.8 13 15.8H5C3.93913 15.8 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>No Clubs Yet</h3>
          <p>No clubs have been created in your college yet. Check back later!</p>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map(club => (
            <ClubCard 
              key={club._id}
              club={club}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubsSection;