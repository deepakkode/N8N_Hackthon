import React, { useState } from 'react';
import axios from 'axios';

const CreateClub = ({ onBack, onClubCreated }) => {
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

  React.useEffect(() => {
    // Pre-fill organizer details from user context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      organizerName: user.name || '',
      organizerEmail: user.email || '',
      organizerDepartment: user.department || '',
      organizerYear: user.year || ''
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await axios.post('http://localhost:5002/api/clubs/create', {
        clubName: formData.clubName,
        clubDescription: formData.clubDescription,
        clubLogo: formData.clubLogo,
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
    <div className="create-club-step">
      <h3>Step 1: Organizer Details</h3>
      <p className="step-description">Confirm your details as the club organizer</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="organizerName">Your Name</label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="organizerEmail">Your Email</label>
          <input
            type="email"
            id="organizerEmail"
            name="organizerEmail"
            value={formData.organizerEmail}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="organizerDepartment">Your Department</label>
          <input
            type="text"
            id="organizerDepartment"
            name="organizerDepartment"
            value={formData.organizerDepartment}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="organizerYear">Your Year</label>
          <input
            type="text"
            id="organizerYear"
            name="organizerYear"
            value={formData.organizerYear}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="create-club-step">
      <h3>Step 2: Club Details</h3>
      <p className="step-description">Provide information about your club</p>
      
      <div className="form-group">
        <label htmlFor="clubName">Club Name</label>
        <input
          type="text"
          id="clubName"
          name="clubName"
          value={formData.clubName}
          onChange={handleChange}
          placeholder="Enter your club name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="clubDescription">Club Description</label>
        <textarea
          id="clubDescription"
          name="clubDescription"
          value={formData.clubDescription}
          onChange={handleChange}
          placeholder="Describe your club's purpose, activities, and goals"
          rows="4"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="clubLogo">Club Logo URL (Optional)</label>
        <input
          type="url"
          id="clubLogo"
          name="clubLogo"
          value={formData.clubLogo}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
        />
        <small className="form-hint">Provide a URL to your club logo image</small>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="create-club-step">
      <h3>Step 3: Faculty Advisor Details</h3>
      <p className="step-description">Enter details of your faculty advisor who will verify the club</p>
      
      <div className="form-group">
        <label htmlFor="facultyName">Faculty Advisor Name</label>
        <input
          type="text"
          id="facultyName"
          name="facultyName"
          value={formData.facultyName}
          onChange={handleChange}
          placeholder="Dr. John Smith"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="facultyEmail">Faculty Email</label>
        <input
          type="email"
          id="facultyEmail"
          name="facultyEmail"
          value={formData.facultyEmail}
          onChange={handleChange}
          placeholder="faculty@klu.ac.in"
          required
        />
        <small className="form-hint">Faculty advisor will receive an OTP for verification</small>
      </div>

      <div className="form-group">
        <label htmlFor="facultyDepartment">Faculty Department</label>
        <input
          type="text"
          id="facultyDepartment"
          name="facultyDepartment"
          value={formData.facultyDepartment}
          onChange={handleChange}
          placeholder="Computer Science Engineering"
          required
        />
      </div>
    </div>
  );

  return (
    <div className="create-club-container">
      <div className="create-club-card">
        <div className="create-club-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <h2>Create Your Club</h2>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Organizer</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Club Details</span>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Faculty</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-club-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleNextStep}
                disabled={
                  (currentStep === 2 && (!formData.clubName || !formData.clubDescription)) ||
                  (currentStep === 3 && (!formData.facultyName || !formData.facultyEmail || !formData.facultyDepartment))
                }
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !formData.facultyName || !formData.facultyEmail || !formData.facultyDepartment}
              >
                {loading ? 'Creating Club...' : 'Create Club'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClub;