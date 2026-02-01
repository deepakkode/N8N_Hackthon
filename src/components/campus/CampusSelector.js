import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './CampusSelector.css';

const CampusSelector = ({ user, onCampusChange = () => {} }) => {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    // Set default campus from user profile or first available
    if (campuses.length > 0 && !selectedCampus) {
      const defaultCampus = campuses.find(c => c.id === user?.campusId) || campuses[0];
      setSelectedCampus(defaultCampus);
      if (onCampusChange && typeof onCampusChange === 'function') {
        onCampusChange(defaultCampus);
      }
    }
  }, [campuses, user, onCampusChange]);

  const fetchCampuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/campuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCampuses(response.data);
    } catch (error) {
      console.error('Error fetching campuses:', error);
      // No fallback - just empty array
      setCampuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove the getDefaultCampuses function entirely

  const handleCampusSelect = (campus) => {
    setSelectedCampus(campus);
    setShowSelector(false);
    
    if (onCampusChange && typeof onCampusChange === 'function') {
      onCampusChange(campus);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('selectedCampus', JSON.stringify(campus));
  };

  if (loading) {
    return (
      <div className="campus-selector-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="campus-selector">
      <button 
        className="campus-selector-trigger"
        onClick={() => setShowSelector(!showSelector)}
      >
        <div className="campus-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="campus-name">{selectedCampus?.name || 'Select Campus'}</span>
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          className={`dropdown-arrow ${showSelector ? 'open' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {showSelector && (
        <div className="campus-selector-dropdown">
          <div className="dropdown-header">
            <h3>Select Campus</h3>
            <p>Choose your campus to see relevant events and activities</p>
          </div>
          
          <div className="campuses-list">
            {campuses.map(campus => (
              <div 
                key={campus.id}
                className={`campus-option ${selectedCampus?.id === campus.id ? 'selected' : ''}`}
                onClick={() => handleCampusSelect(campus)}
              >
                <div className="campus-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                
                <div className="campus-details">
                  <div className="campus-header">
                    <h4>{campus.name}</h4>
                    <span className="campus-code">{campus.code}</span>
                  </div>
                  <p className="campus-location">{campus.location}</p>
                  <p className="campus-description">{campus.description}</p>
                  
                  <div className="campus-stats">
                    <div className="stat-item">
                      <span className="stat-number">{campus.stats?.students || 0}</span>
                      <span className="stat-label">Students</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{campus.stats?.events || 0}</span>
                      <span className="stat-label">Events</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{campus.stats?.clubs || 0}</span>
                      <span className="stat-label">Clubs</span>
                    </div>
                  </div>
                </div>
                
                {selectedCampus?.id === campus.id && (
                  <div className="selected-indicator">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="dropdown-footer">
            <p>Can't find your campus? <a href="#contact">Contact support</a></p>
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown */}
      {showSelector && (
        <div 
          className="campus-selector-overlay"
          onClick={() => setShowSelector(false)}
        />
      )}
    </div>
  );
};

export default CampusSelector;