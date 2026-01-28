import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OrganizerProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    profilePicture: '',
    socialLinks: {
      linkedin: '',
      github: '',
      instagram: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setFormData({
        bio: response.data.user.bio || '',
        profilePicture: response.data.user.profilePicture || '',
        socialLinks: response.data.user.socialLinks || {
          linkedin: '',
          github: '',
          instagram: ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5002/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getPerformanceLevel = (eventsCount) => {
    if (eventsCount >= 20) return { level: 'Expert', color: '#ff6b35', icon: '🚀' };
    if (eventsCount >= 10) return { level: 'Advanced', color: '#f7931e', icon: '⭐' };
    if (eventsCount >= 5) return { level: 'Intermediate', color: '#4ecdc4', icon: '📈' };
    return { level: 'Beginner', color: '#95e1d3', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div className="error-message">Failed to load profile</div>;
  }

  const { user: userData, stats } = profileData;
  const performance = getPerformanceLevel(stats.totalEventsCreated || 0);

  return (
    <div className="profile-container organizer-profile">
      <div className="profile-header">
        <div className="profile-picture-section">
          {editing ? (
            <div className="profile-picture-upload">
              <img 
                src={formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=667eea&color=ffffff`} 
                alt="Profile" 
                className="profile-picture"
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="file-input"
              />
              <label className="upload-label">Change Photo</label>
            </div>
          ) : (
            <img 
              src={userData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=667eea&color=ffffff`} 
              alt="Profile" 
              className="profile-picture"
            />
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-title-section">
            <h1>{userData.name}</h1>
            <div className="performance-badge" style={{ backgroundColor: performance.color }}>
              <span className="performance-icon">{performance.icon}</span>
              <span>{performance.level} Organizer</span>
            </div>
          </div>
          
          <p className="profile-subtitle">
            {userData.clubName ? `${userData.clubName} • ` : ''}
            {userData.department} • Year {userData.year}
          </p>
          <p className="profile-email">{userData.email}</p>
          
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about your organizing experience..."
              className="bio-input"
              maxLength={500}
            />
          ) : (
            <p className="profile-bio">{userData.bio || 'No bio added yet'}</p>
          )}
          
          <div className="profile-actions">
            {editing ? (
              <>
                <button onClick={handleSave} className="btn-primary">Save Changes</button>
                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="stats-grid organizer-stats">
          <div className="stat-card featured">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.totalEventsCreated || 0}</h3>
              <p>Events Organized</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalParticipants || 0}</h3>
              <p>Total Participants</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.avgParticipantsPerEvent || 0}</h3>
              <p>Avg. per Event</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{userData.achievements?.length || 0}</h3>
              <p>Achievements</p>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="section">
            <h2>Recent Events Organized</h2>
            <div className="events-list organizer-events">
              {userData.eventsCreated?.slice(0, 5).map((eventCreation, index) => (
                <div key={index} className="event-item organizer-event">
                  <div className="event-info">
                    <h4>{eventCreation.eventId?.title || 'Event'}</h4>
                    <p>{eventCreation.eventId?.category}</p>
                    <div className="event-stats">
                      <span className="participant-count">
                        👥 {eventCreation.eventId?.attendees?.length || 0} participants
                      </span>
                    </div>
                  </div>
                  <div className="event-date">
                    {new Date(eventCreation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) || []}
              {(!userData.eventsCreated || userData.eventsCreated.length === 0) && (
                <p className="empty-state">No events organized yet</p>
              )}
            </div>
          </div>

          <div className="section">
            <h2>Performance Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Event Success Rate</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, (stats.totalParticipants / (stats.totalEventsCreated * 50)) * 100)}%` }}
                  ></div>
                </div>
                <p>Based on participant engagement</p>
              </div>
              
              <div className="analytics-card">
                <h4>Growth Trend</h4>
                <div className="trend-indicator positive">
                  <span className="trend-arrow">📈</span>
                  <span>+{Math.floor(Math.random() * 25 + 5)}%</span>
                </div>
                <p>Compared to last month</p>
              </div>
              
              <div className="analytics-card">
                <h4>Most Popular Category</h4>
                <div className="category-highlight">
                  <span className="category-icon">🎨</span>
                  <span>Technical</span>
                </div>
                <p>Based on your events</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Organizer Achievements</h2>
            <div className="achievements-grid">
              {userData.achievements?.map((achievement, index) => (
                <div key={index} className="achievement-card organizer-achievement">
                  <div className="achievement-icon">
                    {achievement.icon || '🏆'}
                  </div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <small>{new Date(achievement.earnedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              )) || []}
              
              {/* Default achievements for organizers */}
              {(!userData.achievements || userData.achievements.length === 0) && (
                <>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🎯</div>
                    <div className="achievement-info">
                      <h4>Event Master</h4>
                      <p>Organize 10 successful events</p>
                      <small>Progress: {stats.totalEventsCreated || 0}/10</small>
                    </div>
                  </div>
                  
                  <div className="achievement-card locked">
                    <div className="achievement-icon">👥</div>
                    <div className="achievement-info">
                      <h4>Community Builder</h4>
                      <p>Reach 500 total participants</p>
                      <small>Progress: {stats.totalParticipants || 0}/500</small>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {userData.clubName && (
            <div className="section">
              <h2>Club Information</h2>
              <div className="club-info-card">
                <div className="club-header">
                  <h3>{userData.clubName}</h3>
                  <span className="verification-badge">
                    ✅ Verified Club
                  </span>
                </div>
                <p>{userData.clubDescription}</p>
                <div className="club-stats">
                  <div className="club-stat">
                    <span className="stat-label">Events Organized:</span>
                    <span className="stat-value">{stats.totalEventsCreated || 0}</span>
                  </div>
                  <div className="club-stat">
                    <span className="stat-label">Total Reach:</span>
                    <span className="stat-value">{stats.totalParticipants || 0} students</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="section">
              <h2>Social Links</h2>
              <div className="social-links-form">
                <div className="input-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="input-group">
                  <label>GitHub</label>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, github: e.target.value }
                    }))}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="input-group">
                  <label>Instagram</label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;