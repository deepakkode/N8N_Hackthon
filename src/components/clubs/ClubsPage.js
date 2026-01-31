import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import ClubCard from './ClubCard';
import CreateClub from './CreateClub';
import './ClubsPage.css';

const ClubsPage = ({ user }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateClub, setShowCreateClub] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token available, using demo data');
        const demoClubs = getDemoClubs();
        console.log('Demo clubs:', demoClubs);
        setClubs(demoClubs);
        setError('');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched clubs:', response.data);
      
      // If API returns empty array or no clubs, use demo data
      if (!response.data || response.data.length === 0) {
        console.log('No clubs from API, using demo data');
        const demoClubs = getDemoClubs();
        console.log('Demo clubs:', demoClubs);
        setClubs(demoClubs);
      } else {
        setClubs(response.data);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching clubs:', error);
      console.log('API failed, using demo data');
      const demoClubs = getDemoClubs();
      console.log('Demo clubs:', demoClubs);
      setClubs(demoClubs);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const getDemoClubs = () => [
    {
      _id: 'demo-club-1',
      clubName: 'Tech Innovation Club',
      clubDescription: 'Exploring cutting-edge technology and innovation through projects, workshops, and competitions. Join us for hackathons, coding sessions, and tech talks.',
      organizer: { name: 'Dr. Smith', department: 'Computer Science' },
      eventCount: 8,
      memberCount: 45,
      clubLogo: null,
      isActive: true
    },
    {
      _id: 'demo-club-2',
      clubName: 'Cultural Society',
      clubDescription: 'Celebrating arts, culture, and traditions through various cultural events and performances. Experience diverse cultures and artistic expressions.',
      organizer: { name: 'Prof. Johnson', department: 'Arts & Literature' },
      eventCount: 12,
      memberCount: 67,
      clubLogo: null,
      isActive: true
    },
    {
      _id: 'demo-club-3',
      clubName: 'Sports Club',
      clubDescription: 'Promoting fitness and competitive sports across various disciplines. Join us for tournaments, training sessions, and fitness activities.',
      organizer: { name: 'Coach Williams', department: 'Physical Education' },
      eventCount: 15,
      memberCount: 89,
      clubLogo: null,
      isActive: true
    },
    {
      _id: 'demo-club-4',
      clubName: 'Photography Club',
      clubDescription: 'Capturing moments and exploring the art of photography. Learn techniques, share your work, and participate in photo walks.',
      organizer: { name: 'Ms. Davis', department: 'Fine Arts' },
      eventCount: 6,
      memberCount: 32,
      clubLogo: null,
      isActive: true
    },
    {
      _id: 'demo-club-5',
      clubName: 'Debate Society',
      clubDescription: 'Enhancing communication skills and critical thinking through structured debates and public speaking events.',
      organizer: { name: 'Prof. Brown', department: 'English Literature' },
      eventCount: 10,
      memberCount: 28,
      clubLogo: null,
      isActive: true
    }
  ];

  const getFilteredClubs = () => {
    return clubs.filter(club => {
      const matchesSearch = club.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.clubDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || 
                              club.organizer?.department?.toLowerCase().includes(selectedDepartment.toLowerCase());
      return matchesSearch && matchesDepartment;
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(clubs.map(club => club.organizer?.department).filter(Boolean))];
    return departments;
  };

  const getStats = () => {
    const totalMembers = clubs.reduce((sum, club) => sum + (club.memberCount || 0), 0);
    const totalEvents = clubs.reduce((sum, club) => sum + (club.eventCount || 0), 0);
    const departments = getDepartments().length;
    return { totalClubs: clubs.length, totalMembers, totalEvents, departments };
  };

  const handleClubCreated = () => {
    setShowCreateClub(false);
    fetchClubs();
  };

  if (loading) {
    return (
      <div className="clubs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredClubs = getFilteredClubs();
  const departments = getDepartments();

  // Debug logging
  console.log('ClubsPage render - clubs:', clubs);
  console.log('ClubsPage render - filteredClubs:', filteredClubs);
  console.log('ClubsPage render - loading:', loading);

  return (
    <div className="clubs-page">
      {/* Hero Section */}
      <div className="clubs-hero">
        <div className="hero-content">
          <h1>Campus Clubs</h1>
          <p>Discover and join clubs that match your interests and passions</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Search clubs by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="hero-stats">
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
              <span className="stat-number">{stats.totalClubs}</span>
              <span className="stat-label">Active Clubs</span>
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
              <span className="stat-number">{stats.totalMembers}</span>
              <span className="stat-label">Total Members</span>
            </div>
          </div>
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
              <span className="stat-number">{stats.totalEvents}</span>
              <span className="stat-label">Events Hosted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10C3.10457 10 4 10.8954 4 12C4 13.1046 3.10457 14 2 14V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V14C20.8954 14 20 13.1046 20 12C20 10.8954 20.8954 10 22 10Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.departments}</span>
              <span className="stat-label">Departments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {user?.userType === 'organizer' && !user?.isClubVerified && (
        <div className="action-bar">
          <div className="action-container">
            <div className="action-content">
              <h3>Ready to start your own club?</h3>
              <p>Create and manage your own club to organize events and build a community</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateClub(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Club
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Filter by Department</label>
            <div className="department-pills">
              <button
                className={`department-pill ${selectedDepartment === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDepartment('all')}
              >
                All Departments
              </button>
              {departments.map(department => (
                <button
                  key={department}
                  className={`department-pill ${selectedDepartment === department ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment(department)}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="content-section">
        {error && <div className="error-banner">{error}</div>}
        
        {filteredClubs.length === 0 ? (
          <div className="no-content">
            <div className="no-content-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No clubs found</h3>
            <p>
              {searchTerm || selectedDepartment !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No clubs have been created yet. Be the first to start a club!'
              }
            </p>
          </div>
        ) : (
          <div className="clubs-grid">
            {filteredClubs.map(club => (
              <ClubCard
                key={club._id}
                club={club}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreateClub && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateClub 
              onClose={() => setShowCreateClub(false)}
              onClubCreated={handleClubCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;