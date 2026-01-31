import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const CreateClub = ({ onBack, onClubCreated }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Organizer details (pre-filled from user data)
    organizerName: '',
    organizerEmail: '',
    organizerDepartment: '',
    organizerYear: '',
    
    // Club details
    clubName: '',
    clubDescription: '',
    clubLogo: '',
    
    // Faculty details
    facultyName: '',
    facultyEmail: '',
    facultyDepartment: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  React.useEffect(() => {
    // Pre-fill organizer details from AuthContext user
    console.log('Current user from AuthContext:', user);
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizerName: user.name || '',
        organizerEmail: user.email || '',
        organizerDepartment: user.department || '',
        organizerYear: user.year || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image size should be less than 5MB');
    }

    return true;
  };

  // Handle file upload
  const handleLogoUpload = async (file) => {
    try {
      setLogoUploading(true);
      setError('');

      validateImageFile(file);
      const base64 = await convertToBase64(file);
      
      setFormData(prev => ({
        ...prev,
        clubLogo: base64
      }));
      setLogoPreview(base64);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleLogoUpload(files[0]);
    }
  };

  // Handle paste from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        handleLogoUpload(file);
        break;
      }
    }
  };

  // Remove uploaded logo
  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      clubLogo: ''
    }));
    setLogoPreview('');
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/clubs/create`, {
        name: formData.clubName,
        description: formData.clubDescription,
        logo: formData.clubLogo,
        facultyName: formData.facultyName,
        facultyEmail: formData.facultyEmail,
        facultyDepartment: formData.facultyDepartment
      });

      onClubCreated(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h3>Organizer Details</h3>
        <p>Confirm your information as the club organizer</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="organizerName">Full Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="organizerName"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="organizerEmail">Email Address</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="organizerEmail"
              name="organizerEmail"
              value={formData.organizerEmail}
              onChange={handleChange}
              placeholder="your.email@klu.ac.in"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="organizerDepartment">Department</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="organizerDepartment"
              name="organizerDepartment"
              value={formData.organizerDepartment}
              onChange={handleChange}
              placeholder="Computer Science Engineering"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21L12 2L3 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="organizerYear">Academic Year</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="organizerYear"
              name="organizerYear"
              value={formData.organizerYear}
              onChange={handleChange}
              placeholder="2nd Year"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0494 20.9944 15.5901 20.2 15.3954" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Club Information</h3>
        <p>Tell us about your club and its mission</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="clubName">Club Name *</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="clubName"
              name="clubName"
              value={formData.clubName}
              onChange={handleChange}
              placeholder="Enter your club name"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="clubDescription">Club Description *</label>
          <div className="textarea-wrapper">
            <textarea
              id="clubDescription"
              name="clubDescription"
              value={formData.clubDescription}
              onChange={handleChange}
              placeholder="Describe your club's purpose, activities, and goals..."
              rows="4"
              required
            />
          </div>
          <small className="form-hint">Minimum 50 characters recommended</small>
        </div>

        <div className="form-group full-width">
          <label htmlFor="clubLogo">Club Logo *</label>
          
          {!logoPreview ? (
            <div 
              className="image-upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
              tabIndex={0}
            >
              <input
                type="file"
                id="clubLogo"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <div className="upload-content">
                {logoUploading ? (
                  <div className="upload-loading">
                    <div className="loading-spinner"></div>
                    <p>Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h4>Upload Club Logo</h4>
                    <p>Drag & drop an image here, or click to browse</p>
                    <p className="upload-hint">You can also paste an image from clipboard (Ctrl+V)</p>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => document.getElementById('clubLogo').click()}
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={logoPreview} alt="Club logo preview" />
                <div className="image-overlay">
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm"
                    onClick={removeLogo}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Remove
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => document.getElementById('clubLogo').click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H16C17.1046 20 18 19.1046 18 18V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Change
                  </button>
                </div>
              </div>
              <input
                type="file"
                id="clubLogo"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
          
          <small className="form-hint">
            Supported formats: JPEG, PNG, GIF, WebP (Max size: 5MB)
          </small>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Faculty Verification</h3>
        <p>Faculty advisor details for club verification</p>
      </div>
      
      <div className="verification-info">
        <div className="info-card">
          <div className="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="info-content">
            <h4>Verification Process</h4>
            <p>Your faculty advisor will receive an OTP via email to verify and approve your club registration.</p>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="facultyName">Faculty Advisor Name *</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="facultyName"
              name="facultyName"
              value={formData.facultyName}
              onChange={handleChange}
              placeholder="Dr. John Smith"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="facultyEmail">Faculty Email *</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="facultyEmail"
              name="facultyEmail"
              value={formData.facultyEmail}
              onChange={handleChange}
              placeholder="faculty@klu.ac.in"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <small className="form-hint">Faculty will receive OTP for verification</small>
        </div>

        <div className="form-group full-width">
          <label htmlFor="facultyDepartment">Faculty Department *</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="facultyDepartment"
              name="facultyDepartment"
              value={formData.facultyDepartment}
              onChange={handleChange}
              placeholder="Computer Science Engineering"
              required
            />
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21L12 2L3 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-club-container">
      <div className="create-club-wrapper">
        <div className="create-club-header">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="header-content">
            <h1>Create Your Club</h1>
            <p>Set up your club profile and get it verified by faculty</p>
          </div>
        </div>

        <div className="create-club-card">
          {/* Beautiful Progress Indicator */}
          <div className="progress-container">
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {currentStep > 1 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>1</span>
                  )}
                </div>
                <div className="step-info">
                  <span className="step-title">Organizer</span>
                  <span className="step-desc">Your details</span>
                </div>
              </div>

              <div className={`progress-connector ${currentStep >= 2 ? 'active' : ''}`}></div>

              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {currentStep > 2 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>2</span>
                  )}
                </div>
                <div className="step-info">
                  <span className="step-title">Club Details</span>
                  <span className="step-desc">Club information</span>
                </div>
              </div>

              <div className={`progress-connector ${currentStep >= 3 ? 'active' : ''}`}></div>

              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-circle">
                  <span>3</span>
                </div>
                <div className="step-info">
                  <span className="step-title">Faculty</span>
                  <span className="step-desc">Verification</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <div className="error-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-club-form">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!formData.organizerName || !formData.organizerEmail || !formData.organizerDepartment || !formData.organizerYear)) ||
                    (currentStep === 2 && (!formData.clubName || !formData.clubDescription || !formData.clubLogo))
                  }
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={loading || !formData.facultyName || !formData.facultyEmail || !formData.facultyDepartment}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating Club...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Create Club
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClub;