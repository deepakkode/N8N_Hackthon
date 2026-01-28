import React, { useState } from 'react';

const CreateEventWizard = ({ onClose, onCreateEvent }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    // Step 1: Basic Details
    name: '',
    description: '',
    poster: null,
    venue: '',
    collegeName: '',
    category: '',
    date: '',
    time: '',
    maxParticipants: '',
    
    // Step 2: Registration Form
    registrationForm: {
      fields: [
        { id: 1, type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { id: 2, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
        { id: 3, type: 'tel', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' }
      ]
    },
    
    // Step 3: Payment Details
    paymentRequired: false,
    paymentAmount: '',
    paymentQR: null,
    paymentInstructions: ''
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setEventData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = () => {
    onCreateEvent(eventData);
    onClose();
  };

  const renderProgressBar = () => (
    <div className="wizard-progress">
      <div className="progress-steps">
        {[1, 2, 3].map(step => (
          <div key={step} className="progress-step-container">
            <div className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              {currentStep > step ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={`step-label ${currentStep >= step ? 'active' : ''}`}>
              {step === 1 && 'Event Details'}
              {step === 2 && 'Registration Form'}
              {step === 3 && 'Payment Setup'}
            </span>
            {step < 3 && <div className={`progress-line ${currentStep > step ? 'completed' : ''}`}></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Event Details</h3>
        <p>Provide basic information about your event</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Event Name *</label>
          <input
            type="text"
            value={eventData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter event name"
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            value={eventData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="competition">Competition</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Event Description *</label>
          <textarea
            value={eventData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your event in detail..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>College/University *</label>
          <input
            type="text"
            value={eventData.collegeName}
            onChange={(e) => handleInputChange('collegeName', e.target.value)}
            placeholder="Enter college/university name"
            required
          />
        </div>

        <div className="form-group">
          <label>Venue *</label>
          <input
            type="text"
            value={eventData.venue}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            placeholder="Enter venue details"
            required
          />
        </div>

        <div className="form-group">
          <label>Event Date *</label>
          <input
            type="date"
            value={eventData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Event Time *</label>
          <input
            type="time"
            value={eventData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Max Participants</label>
          <input
            type="number"
            value={eventData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            placeholder="Enter maximum participants (optional)"
          />
        </div>

        <div className="form-group full-width">
          <label>Event Poster</label>
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('poster', e.target.files[0])}
              className="file-input"
              id="poster-upload"
            />
            <label htmlFor="poster-upload" className="file-upload-label">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {eventData.poster ? eventData.poster.name : 'Upload Event Poster'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Registration Form Builder</h3>
        <p>Create a custom registration form for your event</p>
      </div>
      
      <FormBuilder 
        eventData={eventData}
        setEventData={setEventData}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Payment Setup</h3>
        <p>Configure payment details for your event</p>
      </div>
      
      <PaymentSetup 
        eventData={eventData}
        setEventData={setEventData}
      />
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="create-event-wizard">
        <div className="wizard-header">
          <h2>Create New Event</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {renderProgressBar()}

        <div className="wizard-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="wizard-footer">
          <div className="wizard-actions">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={handlePrevious}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Builder Component
const FormBuilder = ({ eventData, setEventData }) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'tel', label: 'Phone', icon: '📞' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'radio', label: 'Radio Button', icon: '⚪' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'date', label: 'Date', icon: '📅' }
  ];

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };

    setEventData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: [...prev.registrationForm.fields, newField]
      }
    }));
  };

  const updateField = (fieldId, updates) => {
    setEventData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: prev.registrationForm.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    }));
  };

  const removeField = (fieldId) => {
    setEventData(prev => ({
      ...prev,
      registrationForm: {
        ...prev.registrationForm,
        fields: prev.registrationForm.fields.filter(field => field.id !== fieldId)
      }
    }));
  };

  return (
    <div className="form-builder">
      <div className="form-builder-sidebar">
        <h4>Form Elements</h4>
        <div className="field-types">
          {fieldTypes.map(fieldType => (
            <button
              key={fieldType.type}
              className="field-type-btn"
              onClick={() => addField(fieldType.type)}
            >
              <span className="field-icon">{fieldType.icon}</span>
              {fieldType.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-builder-canvas">
        <div className="form-preview">
          <h4>Registration Form Preview</h4>
          <div className="form-fields">
            {eventData.registrationForm.fields.map(field => (
              <FormFieldEditor
                key={field.id}
                field={field}
                onUpdate={(updates) => updateField(field.id, updates)}
                onRemove={() => removeField(field.id)}
              />
            ))}
            {eventData.registrationForm.fields.length === 0 && (
              <div className="empty-form">
                <p>Add form fields from the sidebar to build your registration form</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Field Editor Component
const FormFieldEditor = ({ field, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className="field-preview"
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            disabled
            className="field-preview"
            rows="3"
          />
        );
      case 'select':
        return (
          <select disabled className="field-preview">
            <option>Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option, index) => (
              <label key={index} className="radio-option">
                <input type="radio" name={`field-${field.id}`} disabled />
                {option}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <label className="checkbox-option">
            <input type="checkbox" disabled />
            {field.label}
          </label>
        );
      case 'file':
        return (
          <input
            type="file"
            disabled
            className="field-preview"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            disabled
            className="field-preview"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-field-editor">
      <div className="field-header">
        <div className="field-info">
          <span className="field-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </span>
          <span className="field-type">{field.type}</span>
        </div>
        <div className="field-actions">
          <button
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="remove-btn"
            onClick={onRemove}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="field-editor">
          <div className="editor-row">
            <div className="form-group">
              <label>Field Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                />
                Required Field
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Placeholder Text</label>
            <input
              type="text"
              value={field.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
            />
          </div>

          {(field.type === 'select' || field.type === 'radio') && (
            <div className="form-group">
              <label>Options</label>
              <OptionsEditor
                options={field.options || []}
                onChange={(options) => onUpdate({ options })}
              />
            </div>
          )}
        </div>
      )}

      <div className="field-preview-container">
        {renderFieldPreview()}
      </div>
    </div>
  );
};

// Options Editor Component
const OptionsEditor = ({ options, onChange }) => {
  const addOption = () => {
    onChange([...options, `Option ${options.length + 1}`]);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const removeOption = (index) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="options-editor">
      {options.map((option, index) => (
        <div key={index} className="option-row">
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="remove-option-btn"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="add-option-btn"
      >
        + Add Option
      </button>
    </div>
  );
};

// Payment Setup Component
const PaymentSetup = ({ eventData, setEventData }) => {
  const handlePaymentToggle = (enabled) => {
    setEventData(prev => ({
      ...prev,
      paymentRequired: enabled,
      paymentAmount: enabled ? prev.paymentAmount : '',
      paymentQR: enabled ? prev.paymentQR : null,
      paymentInstructions: enabled ? prev.paymentInstructions : ''
    }));
  };

  return (
    <div className="payment-setup">
      <div className="payment-toggle">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={eventData.paymentRequired}
            onChange={(e) => handlePaymentToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">Require Payment for Registration</span>
        </label>
      </div>

      {eventData.paymentRequired && (
        <div className="payment-details">
          <div className="form-group">
            <label>Registration Fee *</label>
            <div className="amount-input">
              <span className="currency">₹</span>
              <input
                type="number"
                value={eventData.paymentAmount}
                onChange={(e) => setEventData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment QR Code *</label>
            <div className="qr-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEventData(prev => ({ ...prev, paymentQR: e.target.files[0] }))}
                className="file-input"
                id="qr-upload"
              />
              <label htmlFor="qr-upload" className="qr-upload-label">
                {eventData.paymentQR ? (
                  <div className="qr-preview">
                    <img 
                      src={URL.createObjectURL(eventData.paymentQR)} 
                      alt="Payment QR" 
                      className="qr-image"
                    />
                    <p>{eventData.paymentQR.name}</p>
                  </div>
                ) : (
                  <div className="qr-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="5" height="5" stroke="currentColor" strokeWidth="2"/>
                      <rect x="16" y="3" width="5" height="5" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="16" width="5" height="5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 16H20V20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>Upload Payment QR Code</p>
                    <span>Students will scan this QR to make payment</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Instructions</label>
            <textarea
              value={eventData.paymentInstructions}
              onChange={(e) => setEventData(prev => ({ ...prev, paymentInstructions: e.target.value }))}
              placeholder="Provide payment instructions for students (e.g., UPI ID, account details, etc.)"
              rows="4"
            />
          </div>

          <div className="payment-info">
            <div className="info-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h4>Payment Verification Process</h4>
                <p>Students will upload payment screenshots which you can review and approve in the applications section.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!eventData.paymentRequired && (
        <div className="free-event-info">
          <div className="info-card success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h4>Free Event</h4>
              <p>This event is free to attend. Students can register without any payment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEventWizard;