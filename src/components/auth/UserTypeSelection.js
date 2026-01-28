import React from 'react';

const UserTypeSelection = ({ onSelectType, onSwitchToLogin }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to College Events</h2>
        <p className="auth-subtitle">Choose your account type to get started</p>
        
        <div className="user-type-selection">
          <div 
            className="user-type-card"
            onClick={() => onSelectType('student')}
          >
            <div className="user-type-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 9L12 15L21 12.09V17H23V9L12 3Z" fill="currentColor"/>
                <path d="M5 13.18V17.18C5 19.45 8.13 21 12 21S19 19.45 19 17.18V13.18L12 15.82L5 13.18Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Student</h3>
            <p>Join and participate in college events</p>
          </div>
          
          <div 
            className="user-type-card"
            onClick={() => onSelectType('organizer')}
          >
            <div className="user-type-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="currentColor"/>
                <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Event Organizer</h3>
            <p>Create and manage college events</p>
          </div>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToLogin}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;