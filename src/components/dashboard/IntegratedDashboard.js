import React from 'react';

const IntegratedDashboard = ({ events, user }) => {
  return (
    <div className="integrated-dashboard">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name}!</p>
      <p>Total Events: {events?.length || 0}</p>
    </div>
  );
};

export default IntegratedDashboard;