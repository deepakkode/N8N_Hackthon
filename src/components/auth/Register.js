import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ userType, onSwitchToLogin, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    year: '',
    department: '',
    section: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const registrationData = {
      ...formData,
      userType
    };

    const result = await register(registrationData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const departmentOptions = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Management Studies',
    'Commerce',
    'Arts and Sciences'
  ];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2>Register as {userType === 'student' ? 'Student' : 'Event Organizer'}</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">College Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@klu.ac.in"
              required
            />
            <small className="form-hint">Use your official college email address</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="section">Section</label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="A, B, C..."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

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

export default Register;