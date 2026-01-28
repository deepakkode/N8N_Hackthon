import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Profile = ({ user, onLogout }) => {
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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  const { user: userData, stats } = profileData;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-picture-container">
            {editing ? (
              <div className="profile-picture-upload">
                <img 
                  src={formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=1e293b&color=ffffff`} 
                  alt="Profile" 
                  className="profile-picture-large"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="file-input"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Change Photo
                </label>
              </div>
            ) : (
              <img 
                src={userData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=150&background=1e293b&color=ffffff`} 
                alt="Profile" 
                className="profile-picture-large"
              />
            )}
          </div>
          
          <div className="profile-info-section">
            <h1>{userData.name}</h1>
            <p className="profile-role">{userData.userType} • {userData.department}</p>
            <p className="profile-details">Year {userData.year} • Section {userData.section}</p>
            <p className="profile-email">{userData.email}</p>
            
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="bio-textarea"
                maxLength={500}
              />
            ) : (
              <p className="profile-bio">{userData.bio || 'No bio added yet'}</p>
            )}
            
            <div className="profile-actions">
              {editing ? (
                <>
                  <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn btn-primary">Edit Profile</button>
              )}
              <button onClick={onLogout} className="btn btn-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats-section">
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-number">{stats.totalEventsRegistered || 0}</div>
              <div className="stat-label">Events Registered</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{stats.totalEventsWon || 0}</div>
              <div className="stat-label">Events Won</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{stats.totalFavoriteClubs || 0}</div>
              <div className="stat-label">Favorite Clubs</div>
            </div>
          </div>
        </div>

        {/* Events Sections */}
        <div className="profile-content-grid">
          <div className="profile-section">
            <h2>My Registered Events</h2>
            <div className="events-list">
              {userData.eventsRegistered && userData.eventsRegistered.length > 0 ? (
                userData.eventsRegistered.map((registration, index) => (
                  <div key={index} className="event-item">
                    <div className="event-info">
                      <h4>{registration.eventId?.title || 'Event'}</h4>
                      <p>{registration.eventId?.category}</p>
                      <small>Registered: {new Date(registration.registeredAt).toLocaleDateString()}</small>
                    </div>
                    <div className="event-status registered">Registered</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No events registered yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2>Events Won</h2>
            <div className="events-list">
              {userData.eventsWon && userData.eventsWon.length > 0 ? (
                userData.eventsWon.map((win, index) => (
                  <div key={index} className="event-item">
                    <div className="event-info">
                      <h4>{win.eventId?.title || 'Event'}</h4>
                      <p>{win.eventId?.category}</p>
                      <small>Won: {new Date(win.wonAt).toLocaleDateString()}</small>
                    </div>
                    <div className="event-status won">Won</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No events won yet. Keep participating!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        {editing && (
          <div className="profile-section">
            <h2>Social Links</h2>
            <div className="social-links-grid">
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
  );
};

export default Profile;