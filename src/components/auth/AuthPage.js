import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserTypeSelection from './UserTypeSelection';
import Login from './Login';
import Register from './Register';
import EmailVerification from './EmailVerification';

const AuthPage = () => {
  const [currentView, setCurrentView] = useState('userType'); // userType, login, register
  const [selectedUserType, setSelectedUserType] = useState(null);
  const { pendingVerification, verifyEmail } = useAuth();

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('userType');
  };

  const handleVerificationSuccess = (data) => {
    // The AuthContext will handle setting the user and token
    console.log('Verification successful:', data);
  };

  // If there's a pending verification, show the verification screen
  if (pendingVerification) {
    return (
      <div className="auth-page">
        <EmailVerification
          userId={pendingVerification.userId}
          email={pendingVerification.email}
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    );
  }

  return (
    <div className="auth-page">
      {(() => {
        switch (currentView) {
          case 'userType':
            return (
              <UserTypeSelection 
                onSelectType={handleUserTypeSelect}
                onSwitchToLogin={handleSwitchToLogin}
              />
            );
          
          case 'login':
            return (
              <Login 
                onSwitchToRegister={handleSwitchToRegister} 
              />
            );
          
          case 'register':
            return (
              <Register 
                userType={selectedUserType}
                onSwitchToLogin={handleSwitchToLogin}
                onBack={() => setCurrentView('userType')}
              />
            );
          
          default:
            return (
              <UserTypeSelection 
                onSelectType={handleUserTypeSelect}
                onSwitchToLogin={handleSwitchToLogin}
              />
            );
        }
      })()}
    </div>
  );
};

export default AuthPage;