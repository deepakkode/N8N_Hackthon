import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventApplications = ({ eventId, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [eventId]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5002/api/events/${eventId}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5002/api/events/${eventId}/applications/${applicationId}`,
        { registrationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, registrationStatus: status }
            : app
        )
      );
      
      setSelectedApplication(null);
      
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status. Please try again.');
    }
  };

  const updatePaymentStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5002/api/events/${eventId}/applications/${applicationId}`,
        { paymentStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, paymentStatus: status }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.registrationStatus === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="applications-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="applications-modal">
        <div className="applications-header">
          <h2>Event Applications</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="applications-filters">
          <div className="filter-tabs">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="count">
                  {status === 'all' 
                    ? applications.length 
                    : applications.filter(app => app.registrationStatus === status).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="applications-content">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>No applications found</h3>
              <p>No applications match the selected filter.</p>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map(application => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  onViewDetails={() => setSelectedApplication(application)}
                  onUpdateStatus={updateApplicationStatus}
                  onUpdatePayment={updatePaymentStatus}
                  getStatusColor={getStatusColor}
                  getPaymentStatusColor={getPaymentStatusColor}
                />
              ))}
            </div>
          )}
        </div>

        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdateStatus={updateApplicationStatus}
            onUpdatePayment={updatePaymentStatus}
            getStatusColor={getStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
          />
        )}
      </div>
    </div>
  );
};

const ApplicationCard = ({ 
  application, 
  onViewDetails, 
  onUpdateStatus, 
  onUpdatePayment,
  getStatusColor,
  getPaymentStatusColor 
}) => {
  return (
    <div className="application-card">
      <div className="application-header">
        <div className="applicant-info">
          <h4>{application.formData?.get('Full Name') || application.user?.name || 'Unknown'}</h4>
          <p>{application.formData?.get('Email Address') || application.user?.email}</p>
        </div>
        <div className="application-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(application.registrationStatus) }}
          >
            {application.registrationStatus}
          </span>
        </div>
      </div>

      <div className="application-details">
        <div className="detail-item">
          <span className="label">Applied:</span>
          <span>{new Date(application.registeredAt).toLocaleDateString()}</span>
        </div>
        
        {application.paymentScreenshot && (
          <div className="detail-item">
            <span className="label">Payment:</span>
            <span 
              className="payment-status"
              style={{ color: getPaymentStatusColor(application.paymentStatus) }}
            >
              {application.paymentStatus}
            </span>
          </div>
        )}
      </div>

      <div className="application-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onViewDetails}
        >
          View Details
        </button>
        
        {application.registrationStatus === 'pending' && (
          <>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => onUpdateStatus(application._id, 'approved')}
            >
              Approve
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onUpdateStatus(application._id, 'rejected')}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ApplicationDetailsModal = ({ 
  application, 
  onClose, 
  onUpdateStatus, 
  onUpdatePayment,
  getStatusColor,
  getPaymentStatusColor 
}) => {
  return (
    <div className="modal-overlay">
      <div className="application-details-modal">
        <div className="modal-header">
          <h3>Application Details</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="applicant-summary">
            <h4>{application.formData?.get('Full Name') || 'Unknown Applicant'}</h4>
            <p>{application.formData?.get('Email Address') || application.user?.email}</p>
            <div className="status-badges">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.registrationStatus) }}
              >
                Registration: {application.registrationStatus}
              </span>
              {application.paymentScreenshot && (
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getPaymentStatusColor(application.paymentStatus) }}
                >
                  Payment: {application.paymentStatus}
                </span>
              )}
            </div>
          </div>

          <div className="form-data-section">
            <h5>Registration Form Data</h5>
            <div className="form-data-grid">
              {Array.from(application.formData || new Map()).map(([key, value]) => (
                <div key={key} className="form-data-item">
                  <label>{key}:</label>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {application.paymentScreenshot && (
            <div className="payment-section">
              <h5>Payment Screenshot</h5>
              <div className="payment-screenshot">
                <img 
                  src={application.paymentScreenshot} 
                  alt="Payment Screenshot"
                  className="screenshot-image"
                />
              </div>
              
              {application.paymentStatus === 'pending' && (
                <div className="payment-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => onUpdatePayment(application._id, 'verified')}
                  >
                    Verify Payment
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onUpdatePayment(application._id, 'rejected')}
                  >
                    Reject Payment
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="application-actions-section">
            <h5>Application Actions</h5>
            <div className="action-buttons">
              {application.registrationStatus === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => onUpdateStatus(application._id, 'approved')}
                  >
                    Approve Application
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onUpdateStatus(application._id, 'rejected')}
                  >
                    Reject Application
                  </button>
                </>
              )}
              
              {application.registrationStatus !== 'pending' && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => onUpdateStatus(application._id, 'pending')}
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventApplications;