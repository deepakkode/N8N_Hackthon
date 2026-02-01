import React, { useState } from 'react';

// Utility function to format currency - ensures only rupees symbol
const formatCurrency = (amount) => {
  if (!amount || amount <= 0) {
    return 'Free';
  }
  // Remove any existing currency symbols and format with rupees only
  const cleanAmount = String(amount).replace(/[$₹]/g, '');
  return `₹${cleanAmount}`;
};

const EventCard = ({ event, currentUser, onDelete, onRegister, onUnregister }) => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  // Check registration status from userRegistration object
  const userRegistration = event.userRegistration;
  const isRegistered = userRegistration?.registrationStatus === 'approved';
  const isPending = userRegistration?.registrationStatus === 'pending';
  const isRejected = userRegistration?.registrationStatus === 'rejected';
  const attendeeCount = event.attendees?.length || event.registrations?.length || 0;
  const isFull = event.maxParticipants && attendeeCount >= event.maxParticipants;

  const handleRegister = () => {
    if (event.paymentRequired) {
      setShowRegistrationModal(true);
    } else {
      // Direct registration for free events
      if (onRegister) {
        onRegister(event.id || event._id);
      }
    }
  };

  const handleUnregister = () => {
    if (onUnregister) {
      onUnregister(event.id || event._id);
    }
  };

  const getEventPrice = () => {
    if (!event.paymentRequired || !event.paymentAmount) {
      return 'Free';
    }
    // Use utility function to ensure proper currency formatting
    const priceText = formatCurrency(event.paymentAmount);
    console.log('Event price display:', priceText, 'for event:', event.title || event.name);
    return priceText;
  };

  const getRegistrationButton = () => {
    // Explicit organizer check with detailed logging
    const hasCurrentUser = !!currentUser;
    const hasOrganizer = !!event.organizer;
    const currentUserId = currentUser?.id;
    const organizerId = event.organizer?.id;
    const idsMatch = currentUserId === organizerId;
    
    // Only consider someone an organizer if IDs match exactly
    const isOrganizer = hasCurrentUser && hasOrganizer && idsMatch;

    // Debug logging
    console.log('🔍 Organizer Check Debug:', {
      eventName: event.name || event.title,
      hasCurrentUser,
      hasOrganizer,
      currentUserId,
      organizerId,
      idsMatch,
      isOrganizer,
      currentUserEmail: currentUser?.email,
      eventOrganizerEmail: event.organizer?.email
    });

    if (isOrganizer) {
      console.log('🏷️ Showing "Your Event" badge');
      return (
        <div className="organizer-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Your Event
        </div>
      );
    }

    if (userRegistration) {
      if (isPending) {
        return (
          <div className="registration-pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Pending Approval
          </div>
        );
      } else if (isRegistered) {
        return (
          <div className="registration-confirmed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Registered
          </div>
        );
      } else if (isRejected) {
        return (
          <div className="registration-rejected">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Registration Declined
          </div>
        );
      }
    }

    return (
      <button 
        className="btn-register"
        onClick={handleRegister}
        disabled={isFull}
      >
        {isFull ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Event Full
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 21V19C16 16.7909 14.2091 15 12 15C9.79086 15 8 16.7909 8 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Register Now
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="event-card">
        {/* Event Poster - Left Side */}
        <div className="event-poster">
          {event.poster ? (
            <img src={event.poster} alt={event.title || event.name} />
          ) : (
            <div className="event-poster-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Event Content - Right Side */}
        <div className="event-content">
          <div className="event-header">
            <span className="category-badge">
              {event.category || 'General'}
            </span>
            {userRegistration && (
              <span className={`status-badge ${userRegistration.registrationStatus}`}>
                {userRegistration.registrationStatus === 'pending' && 'Pending'}
                {userRegistration.registrationStatus === 'approved' && 'Approved'}
                {userRegistration.registrationStatus === 'rejected' && 'Rejected'}
              </span>
            )}
          </div>
          
          <h3 className="event-title">{event.title || event.name}</h3>
          
          <div className="event-details">
            <div className="event-datetime">
              <div className="event-date">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="event-time">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{formatTime(event.time)}</span>
              </div>
            </div>
            
            <div className="event-location">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{event.venue || event.location || 'Venue TBD'}</span>
            </div>
            
            <div className="event-organizer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Organized by {event.organizer?.name || 'Event Organizer'}</span>
            </div>

            {event.description ? (
              <p className="event-description">{event.description}</p>
            ) : (
              <p className="event-description">
                Join us for an exciting {event.category?.toLowerCase() || 'event'} experience! 
                This event promises to be engaging and informative. 
                Don't miss out on this amazing opportunity to learn and network with fellow participants.
              </p>
            )}
          </div>

          <div className="event-footer">
            <div className="event-meta">
              <div className="attendee-info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="attendee-count">
                  {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </span>
              </div>

              <div className="event-price">
                <span>{getEventPrice()}</span>
              </div>
            </div>

            <div className="event-actions">
              {getRegistrationButton()}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <RegistrationModal
          event={event}
          currentUser={currentUser}
          onClose={() => setShowRegistrationModal(false)}
          onRegister={onRegister}
        />
      )}
    </>
  );
};

// Registration Modal Component
const RegistrationModal = ({ event, currentUser, onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    year: currentUser?.year || '',
    section: currentUser?.section || '',
    paymentScreenshot: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          paymentScreenshot: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onRegister) {
        await onRegister(event.id || event._id, formData);
      }
      onClose();
      alert('Registration submitted successfully! Please wait for organizer approval.');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="registration-modal">
        <div className="modal-header">
          <h2>Register for {event.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Year *</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                placeholder="e.g., A, B, C"
              />
            </div>
          </div>

          {event.paymentRequired && (
            <div className="payment-section">
              <h3>Payment Information</h3>
              <div className="payment-amount">
                <strong>Amount: {formatCurrency(event.paymentAmount)}</strong>
              </div>
              
              {event.paymentQR && (
                <div className="payment-qr">
                  <p>Scan QR code to pay:</p>
                  <img src={event.paymentQR} alt="Payment QR Code" />
                </div>
              )}

              {event.paymentInstructions && (
                <div className="payment-instructions">
                  <p>{event.paymentInstructions}</p>
                </div>
              )}

              <div className="form-group">
                <label>Upload Payment Screenshot *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {formData.paymentScreenshot && (
                  <div className="screenshot-preview">
                    <img src={formData.paymentScreenshot} alt="Payment Screenshot" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCard;