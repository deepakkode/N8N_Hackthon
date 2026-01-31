import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const AddEventModal = ({ onClose, onAddEvent }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Event Details
    name: '',
    description: '',
    poster: '',
    venue: '',
    collegeName: 'KL University',
    category: 'technical',
    date: '',
    time: '',
    maxParticipants: 100,
    
    // Step 2: Registration Form
    registrationForm: {
      fields: [
        { id: 1, type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { id: 2, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
        { id: 3, type: 'tel', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' }
      ]
    },
    
    // Step 3: Payment
    paymentRequired: false,
    paymentAmount: 0,
    paymentQR: '',
    paymentInstructions: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  const validateStep = (step) => {
    switch (step) {
      case 1:
        // Basic required fields including poster
        return formData.name && 
               formData.description && 
               formData.poster &&
               formData.venue && 
               formData.category && 
               formData.date && 
               formData.time;
      case 2:
        return formData.registrationForm.fields.length >= 3;
      case 3:
        if (formData.paymentRequired) {
          return formData.paymentAmount > 0 && formData.paymentQR;
        }
        return true;
      default:
        return false;
    }
  };

  const getValidationMessage = (step) => {
    switch (step) {
      case 1:
        if (!formData.poster) {
          return 'Poster is required to proceed';
        }
        return null;
      case 3:
        if (formData.paymentRequired && !formData.paymentQR) {
          return 'QR code is required for paid events';
        }
        return null;
      default:
        return null;
    }
  };

  const [eventId, setEventId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentStep === 1) {
        // Step 1: Create event with basic details
        const eventData = {
          name: formData.name,
          description: formData.description,
          poster: formData.poster,
          venue: formData.venue,
          collegeName: formData.collegeName,
          category: formData.category,
          date: formData.date,
          time: formData.time,
          maxParticipants: formData.maxParticipants
        };

        const response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(eventData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create event');
        }

        const result = await response.json();
        setEventId(result.event._id);
        setCurrentStep(2);

      } else if (currentStep === 2) {
        // Step 2: Update registration form
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/form`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ registrationForm: formData.registrationForm })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update form');
        }

        setCurrentStep(3);

      } else if (currentStep === 3) {
        // Step 3: Update payment details and publish
        const paymentData = {
          paymentRequired: formData.paymentRequired,
          paymentAmount: formData.paymentAmount,
          paymentQR: formData.paymentQR,
          paymentInstructions: formData.paymentInstructions
        };

        const response = await fetch(`${API_BASE_URL}/events/${eventId}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to publish event');
        }

        // Success - close modal and refresh events
        alert('Event created successfully!');
        onClose(); // Close the modal
        // Call onAddEvent to refresh the events list if provided
        if (onAddEvent && typeof onAddEvent === 'function') {
          onAddEvent();
        }
      }
    } catch (error) {
      console.error('Event creation error:', error);
      alert(error.message || 'Failed to process event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Image upload handlers
  const handleImageUpload = (file, type = 'poster') => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        if (type === 'poster') {
          setFormData(prev => ({ ...prev, poster: base64 }));
          setPosterPreview(base64);
        } else if (type === 'qr') {
          setFormData(prev => ({ ...prev, paymentQR: base64 }));
          setQrPreview(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e, type = 'poster') => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file, type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e, type = 'poster') => {
    const file = e.target.files[0];
    handleImageUpload(file, type);
  };

  // Form builder functions
  const addFormField = () => {
    const newField = {
      id: Date.now(),
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: 'Enter placeholder text',
      options: []
    };
    
    setFormData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: [...prev.registrationForm.fields, newField]
      }
    }));
  };

  const updateFormField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: prev.registrationForm.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    }));
  };

  const removeFormField = (fieldId) => {
    if (formData.registrationForm.fields.length <= 3) {
      alert('You must have at least 3 fields (Name, Email, Phone)');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: prev.registrationForm.fields.filter(field => field.id !== fieldId)
      }
    }));
  };

  const addSelectOption = (fieldId) => {
    const field = formData.registrationForm.fields.find(f => f.id === fieldId);
    const newOption = `Option ${(field.options?.length || 0) + 1}`;
    
    updateFormField(fieldId, {
      options: [...(field.options || []), newOption]
    });
  };

  const updateSelectOption = (fieldId, optionIndex, value) => {
    const field = formData.registrationForm.fields.find(f => f.id === fieldId);
    const updatedOptions = [...(field.options || [])];
    updatedOptions[optionIndex] = value;
    
    updateFormField(fieldId, { options: updatedOptions });
  };

  const removeSelectOption = (fieldId, optionIndex) => {
    const field = formData.registrationForm.fields.find(f => f.id === fieldId);
    const updatedOptions = (field.options || []).filter((_, index) => index !== optionIndex);
    
    updateFormField(fieldId, { options: updatedOptions });
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone Number' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' }
  ];

  return (
    <div className="modern-event-overlay">
      <div className="modern-event-modal">
        {/* Clean Header */}
        <div className="modern-header">
          <div className="header-content">
            <h1>Create Event</h1>
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Modern Step Indicator */}
          <div className="step-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
            <div className="step-dots">
              {[1, 2, 3].map(step => (
                <div 
                  key={step}
                  className={`step-dot ${currentStep >= step ? 'active' : ''}`}
                >
                  {currentStep > step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <div className="step-labels">
              <span className={currentStep >= 1 ? 'active' : ''}>Details</span>
              <span className={currentStep >= 2 ? 'active' : ''}>Form</span>
              <span className={currentStep >= 3 ? 'active' : ''}>Payment</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="event-form">
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="step-content">
                <div className="content-grid">
                  <div className="main-form">
                    <div className="form-section">
                      <h2>Event Information</h2>
                      
                      <div className="input-group">
                        <label>Event Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your event name"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label>Description *</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe your event in detail..."
                          rows="4"
                          required
                        />
                      </div>

                      <div className="input-row">
                        <div className="input-group">
                          <label>Category *</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                          >
                            <option value="technical">Technical</option>
                            <option value="cultural">Cultural</option>
                            <option value="sports">Sports</option>
                            <option value="academic">Academic</option>
                            <option value="workshop">Workshop</option>
                            <option value="seminar">Seminar</option>
                            <option value="competition">Competition</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label>Max Participants</label>
                          <input
                            type="number"
                            name="maxParticipants"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                            min="1"
                            placeholder="100"
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Venue *</label>
                        <input
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleChange}
                          placeholder="Event location"
                          required
                        />
                      </div>

                      <div className="input-row">
                        <div className="input-group">
                          <label>Date *</label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>Time *</label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar">
                    <div className="upload-section">
                      <div className="input-group">
                        <label>Event Poster *</label>
                        {!formData.poster && (
                          <div className="validation-hint">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Poster is required to proceed
                          </div>
                        )}
                      </div>
                      
                      {!posterPreview ? (
                        <div
                          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                          onDrop={(e) => handleDrop(e, 'poster')}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="7,10 12,5 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h4>Upload Poster</h4>
                          <p>Drag & drop or click to browse</p>
                          <span>JPG, PNG, GIF • Max 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'poster')}
                            className="file-input"
                          />
                        </div>
                      ) : (
                        <div className="image-preview">
                          <div className="preview-header">
                            <span>Poster Preview</span>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setPosterPreview(null); 
                                setFormData(prev => ({ ...prev, poster: '' })); 
                              }} 
                              className="remove-btn"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                          <div className="preview-image">
                            <img src={posterPreview} alt="Event poster" />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setPosterPreview(null)} 
                            className="change-btn"
                          >
                            Change Poster
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Form Builder */}
            {currentStep === 2 && (
              <div className="step-content">
                <div className="form-builder-content">
                  <div className="builder-header">
                    <h2>Registration Form</h2>
                    <p>Create a custom form for students to fill when registering</p>
                    <button type="button" onClick={addFormField} className="add-field-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add Field
                    </button>
                  </div>
                  
                  <div className="form-fields">
                    {formData.registrationForm.fields.map((field, index) => (
                      <div key={field.id} className="field-builder">
                        <div className="field-header">
                          <div className="field-number">{index + 1}</div>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                            className="field-label"
                            placeholder="Field label"
                          />
                          {index >= 3 && (
                            <button 
                              type="button" 
                              onClick={() => removeFormField(field.id)} 
                              className="remove-field"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="field-settings">
                          <div className="setting">
                            <label>Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => updateFormField(field.id, { 
                                type: e.target.value, 
                                options: ['select', 'radio', 'checkbox'].includes(e.target.value) ? ['Option 1'] : [] 
                              })}
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="setting">
                            <label>Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                              placeholder="Enter placeholder"
                            />
                          </div>
                          
                          <div className="setting">
                            <label className="checkbox-setting">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                                disabled={index < 3}
                              />
                              Required
                            </label>
                          </div>
                        </div>
                        
                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                          <div className="options-section">
                            <div className="options-header">
                              <label>Options</label>
                              <button type="button" onClick={() => addSelectOption(field.id)} className="add-option">
                                Add Option
                              </button>
                            </div>
                            <div className="options-list">
                              {(field.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="option-item">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateSelectOption(field.id, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  {field.options.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeSelectOption(field.id, optionIndex)} 
                                      className="remove-option"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="field-preview">
                          <label>
                            {field.label} {field.required && <span className="required">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea placeholder={field.placeholder} disabled />
                          ) : field.type === 'select' ? (
                            <select disabled>
                              <option>{field.placeholder || 'Select an option'}</option>
                              {(field.options || []).map((option, i) => (
                                <option key={i}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === 'radio' ? (
                            <div className="radio-preview">
                              {(field.options || []).map((option, i) => (
                                <label key={i}>
                                  <input type="radio" name={`preview-${field.id}`} disabled />
                                  {option}
                                </label>
                              ))}
                            </div>
                          ) : field.type === 'checkbox' ? (
                            <div className="checkbox-preview">
                              {(field.options || []).map((option, i) => (
                                <label key={i}>
                                  <input type="checkbox" disabled />
                                  {option}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="step-content">
                <div className="payment-content">
                  <div className="payment-header">
                    <h2>Payment Setup</h2>
                    <p>Configure payment details if your event requires fees</p>
                  </div>
                  
                  <div className="payment-toggle">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        name="paymentRequired"
                        checked={formData.paymentRequired}
                        onChange={handleChange}
                      />
                      <span className="slider"></span>
                      This event requires payment
                    </label>
                  </div>
                  
                  {formData.paymentRequired ? (
                    <div className="payment-details">
                      <div className="payment-form">
                        <div className="input-group">
                          <label>Registration Fee (₹) *</label>
                          <input
                            type="number"
                            name="paymentAmount"
                            value={formData.paymentAmount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            min="1"
                            required
                          />
                        </div>
                        
                        <div className="input-group">
                          <label>Payment Instructions</label>
                          <textarea
                            name="paymentInstructions"
                            value={formData.paymentInstructions}
                            onChange={handleChange}
                            placeholder="Add payment instructions (optional)"
                            rows="3"
                          />
                        </div>
                      </div>
                      
                      <div className="qr-section">
                        <h3>Payment QR Code *</h3>
                        
                        {!qrPreview ? (
                          <div
                            className={`upload-area qr-upload ${dragActive ? 'drag-active' : ''}`}
                            onDrop={(e) => handleDrop(e, 'qr')}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                          >
                            <div className="upload-icon">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                                <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                                <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </div>
                            <h4>Upload QR Code</h4>
                            <p>Upload your payment QR code</p>
                            <span>JPG, PNG • Max 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e, 'qr')}
                              className="file-input"
                            />
                          </div>
                        ) : (
                          <div className="image-preview qr-preview">
                            <div className="preview-header">
                              <span>QR Code Preview</span>
                              <button 
                                type="button" 
                                onClick={() => { 
                                  setQrPreview(null); 
                                  setFormData(prev => ({ ...prev, paymentQR: '' })); 
                                }} 
                                className="remove-btn"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                            <div className="preview-image qr-image">
                              <img src={qrPreview} alt="Payment QR Code" />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setQrPreview(null)} 
                              className="change-btn"
                            >
                              Change QR Code
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="free-event">
                      <div className="free-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3>Free Event</h3>
                      <p>This event is free for all participants. Students can register without any payment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="form-actions">
              <div className="action-left">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrevious} className="btn-back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                )}
              </div>
              
              <div className="action-right">
                <button type="button" onClick={onClose} className="btn-cancel">
                  Cancel
                </button>
                <div className="next-button-container">
                  {getValidationMessage(currentStep) && (
                    <div className="validation-message">
                      {getValidationMessage(currentStep)}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    className="btn-next" 
                    disabled={isSubmitting || !validateStep(currentStep)}
                  >
                    {currentStep < 3 ? (
                      <>
                        {isSubmitting ? 'Saving...' : 'Next'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    ) : (
                      <>
                        {isSubmitting ? 'Publishing...' : 'Create Event'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;