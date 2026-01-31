import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    year: user?.year || '',
    section: user?.section || ''
  });
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsCompleted: 0,
    clubsJoined: 0,
    eventsCreated: 0,
    totalApplications: 0
  });

  useEffect(() => {
    // Fetch user statistics from API
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      if (user?.userType === 'student') {
        // Fetch student statistics
        const response = await axios.get(`${API_BASE_URL}/events/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const myEvents = response.data;
        const registered = myEvents.filter(e => e.userRegistration?.registrationStatus === 'approved').length;
        const pending = myEvents.filter(e => e.userRegistration?.registrationStatus === 'pending').length;
        const completed = myEvents.filter(e => 
          e.userRegistration?.registrationStatus === 'approved' && 
          new Date(e.date) < new Date()
        ).length;
        
        setStats({
          eventsRegistered: myEvents.length,
          eventsCompleted: completed,
          clubsJoined: 0, // This would need a separate API call
          eventsCreated: 0,
          totalApplications: 0
        });
      } else {
        // Fetch organizer statistics
        const response = await axios.get(`${API_BASE_URL}/events/organizer/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const myEvents = response.data;
        const totalApplications = myEvents.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
        
        setStats({
          eventsRegistered: 0,
          eventsCompleted: 0,
          clubsJoined: 0,
          eventsCreated: myEvents.length,
          totalApplications: totalApplications
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to default stats if API fails
      setStats({
        eventsRegistered: 0,
        eventsCompleted: 0,
        clubsJoined: 0,
        eventsCreated: 0,
        totalApplications: 0
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      console.log('Saving profile changes:', editForm);
      // Here you would typically make an API call to update the profile
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (user?.userType === 'student') {
      if (stats.eventsRegistered >= 5) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/></svg>, 
        title: 'Event Explorer', 
        desc: 'Registered for 5+ events' 
      });
      if (stats.eventsCompleted >= 3) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
        title: 'Committed Participant', 
        desc: 'Completed 3+ events' 
      });
      if (stats.clubsJoined >= 2) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 21H21" stroke="currentColor" strokeWidth="2"/><path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2"/></svg>, 
        title: 'Club Enthusiast', 
        desc: 'Joined multiple clubs' 
      });
    } else {
      if (stats.eventsCreated >= 5) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>, 
        title: 'Event Creator', 
        desc: 'Created 5+ events' 
      });
      if (stats.totalApplications >= 20) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>, 
        title: 'Community Builder', 
        desc: '20+ event applications' 
      });
      if (user?.isClubVerified) achievements.push({ 
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2"/></svg>, 
        title: 'Verified Organizer', 
        desc: 'Club verified and active' 
      });
    }
    
    return achievements;
  };

  const getActivityLevel = () => {
    const totalActivity = user?.userType === 'student' 
      ? stats.eventsRegistered + stats.clubsJoined
      : stats.eventsCreated + (stats.totalApplications / 5);
      
    if (totalActivity >= 10) return { level: 'Expert', color: '#10b981', progress: 100 };
    if (totalActivity >= 5) return { level: 'Active', color: '#3b82f6', progress: 75 };
    if (totalActivity >= 2) return { level: 'Beginner', color: '#f59e0b', progress: 50 };
    return { level: 'New', color: '#6b7280', progress: 25 };
  };

  const achievements = getAchievements();
  const activityLevel = getActivityLevel();

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-content">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h1>{user?.name}</h1>
          <p className="user-role">{user?.userType === 'organizer' ? 'Event Organizer' : 'Student'}</p>
          <div className="activity-level">
            <span className="level-label">Activity Level: </span>
            <span className="level-badge" style={{ backgroundColor: activityLevel.color }}>
              {activityLevel.level}
            </span>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="hero-stats">
          {user?.userType === 'student' ? (
            <>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.eventsRegistered}</span>
                  <span className="stat-label">Events Registered</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.eventsCompleted}</span>
                  <span className="stat-label">Events Completed</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 9V21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9V21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.clubsJoined}</span>
                  <span className="stat-label">Clubs Joined</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.eventsCreated}</span>
                  <span className="stat-label">Events Created</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalApplications}</span>
                  <span className="stat-label">Total Applications</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="3,6 21,6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10C12 8.89543 12.8954 8 14 8C15.1046 8 16 8.89543 16 10Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{user?.isClubVerified ? 1 : 0}</span>
                  <span className="stat-label">Club Managed</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="content-grid">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Profile Information</h2>
              <button 
                className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
                onClick={handleEditToggle}
              >
                {isEditing ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Changes
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit Profile
                  </>
                )}
              </button>
            </div>
            
            <div className="profile-details">
              <div className="detail-row">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span>{user?.name}</span>
                )}
              </div>
              
              <div className="detail-row">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span>{user?.email}</span>
                )}
              </div>
              
              <div className="detail-row">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <span>{user?.phone || 'Not provided'}</span>
                )}
              </div>
              
              <div className="detail-row">
                <label>Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span>{user?.department}</span>
                )}
              </div>
              
              {user?.userType === 'student' && (
                <>
                  <div className="detail-row">
                    <label>Year</label>
                    {isEditing ? (
                      <select
                        name="year"
                        value={editForm.year}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    ) : (
                      <span>{user?.year}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Section</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="section"
                        value={editForm.section}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="e.g., A, B, C"
                      />
                    ) : (
                      <span>{user?.section}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Achievements Card */}
          <div className="achievements-card">
            <div className="card-header">
              <h2>Achievements</h2>
              <div className="achievement-count">
                {achievements.length} earned
              </div>
            </div>
            
            <div className="achievements-grid">
              {achievements.length === 0 ? (
                <div className="no-achievements">
                  <div className="no-achievements-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <p>No achievements yet</p>
                  <span>Keep participating to earn achievements!</span>
                </div>
              ) : (
                achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Progress Card */}
          <div className="activity-card">
            <div className="card-header">
              <h2>Activity Progress</h2>
              <div className="progress-level" style={{ color: activityLevel.color }}>
                {activityLevel.level}
              </div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${activityLevel.progress}%`,
                    backgroundColor: activityLevel.color 
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {activityLevel.progress}% to next level
              </div>
            </div>
            
            <div className="activity-tips">
              <h4>Tips to increase activity:</h4>
              <ul>
                {user?.userType === 'student' ? (
                  <>
                    <li>Register for more events</li>
                    <li>Join clubs that interest you</li>
                    <li>Complete registered events</li>
                  </>
                ) : (
                  <>
                    <li>Create more engaging events</li>
                    <li>Promote your events effectively</li>
                    <li>Build a strong club community</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 5H9.5C7.01472 5 5 7.01472 5 9.5C5 11.9853 7.01472 14 9.5 14H14.5C16.9853 14 19 16.0147 19 18.5C19 20.9853 16.9853 23 14.5 23H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download Data
          </button>
          
          <button className="btn btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18C1.64486 18.3024 1.55625 18.6453 1.56383 18.9928C1.57142 19.3402 1.67475 19.6792 1.86298 19.9757C2.05121 20.2723 2.31727 20.5157 2.6302 20.6823C2.94313 20.8489 3.29532 20.9327 3.65 20.9267H20.35C20.7047 20.9327 21.0569 20.8489 21.3698 20.6823C21.6827 20.5157 21.9488 20.2723 22.137 19.9757C22.3253 19.6792 22.4286 19.3402 22.4362 18.9928C22.4437 18.6453 22.3551 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15133C12.6817 2.97953 12.3438 2.88477 12 2.88477C11.6562 2.88477 11.3183 2.97953 11.0188 3.15133C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Report Issue
          </button>
          
          <button className="btn btn-danger" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;