import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
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

  const getAchievementIcon = (title) => {
    const icons = {
      'First Victory': '🏆',
      'Event Enthusiast': '🎯',
      'Club Explorer': '🔍',
      'Social Butterfly': '🦋',
      'Consistent Participant': '⭐'
    };
    return icons[title] || '🎖️';
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture-section">
          {editing ? (
            <div className="profile-picture-upload">
              <img 
                src={formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=3b82f6&color=ffffff`} 
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
              src={userData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=3b82f6&color=ffffff`} 
              alt="Profile" 
              className="profile-picture"
            />
          )}
        </div>
        
        <div className="profile-info">
          <h1>{userData.name}</h1>
          <p className="profile-subtitle">{userData.department} • Year {userData.year} • Section {userData.section}</p>
          <p className="profile-email">{userData.email}</p>
          
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
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
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.totalEventsRegistered}</h3>
              <p>Events Registered</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats.totalEventsWon}</h3>
              <p>Events Won</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{stats.totalFavoriteClubs}</h3>
              <p>Favorite Clubs</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.winRate}%</h3>
              <p>Win Rate</p>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="section">
            <h2>Recent Events</h2>
            <div className="events-list">
              {userData.eventsRegistered.slice(0, 5).map((registration, index) => (
                <div key={index} className="event-item">
                  <div className="event-info">
                    <h4>{registration.eventId?.title || 'Event'}</h4>
                    <p>{registration.eventId?.category}</p>
                  </div>
                  <div className="event-date">
                    {new Date(registration.registeredAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {userData.eventsRegistered.length === 0 && (
                <p className="empty-state">No events registered yet</p>
              )}
            </div>
          </div>

          <div className="section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {userData.achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-icon">
                    {getAchievementIcon(achievement.title)}
                  </div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <small>{new Date(achievement.earnedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
              {userData.achievements.length === 0 && (
                <p className="empty-state">No achievements yet. Participate in events to earn badges!</p>
              )}
            </div>
          </div>

          <div className="section">
            <h2>Favorite Clubs</h2>
            <div className="clubs-grid">
              {userData.favoriteClubs.map((club, index) => (
                <div key={index} className="club-card-mini">
                  <img src={club.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&size=60&background=10b981&color=ffffff`} alt={club.name} />
                  <div>
                    <h4>{club.name}</h4>
                    <p>{club.description?.substring(0, 50)}...</p>
                  </div>
                </div>
              ))}
              {userData.favoriteClubs.length === 0 && (
                <p className="empty-state">No favorite clubs yet</p>
              )}
            </div>
          </div>

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

export default StudentProfile;