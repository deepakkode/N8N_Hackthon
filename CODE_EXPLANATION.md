# Vivento Campus Events Platform - Code Architecture & Implementation

## 🏗️ System Architecture Overview

### Technology Stack
- **Frontend**: React.js with functional components and hooks
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB Atlas (Cloud NoSQL database)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Gmail SMTP with Nodemailer
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context API

### Project Structure
```
vivento-platform/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── events/              # Event management components
│   │   ├── clubs/               # Club management components
│   │   └── profile/             # User profile components
│   ├── context/                 # React Context for state management
│   ├── config/                  # API configuration
│   └── App.js                   # Main application component
├── backend/                     # Node.js backend server
│   ├── models/                  # MongoDB data models
│   ├── routes/                  # API route handlers
│   ├── middleware/              # Custom middleware functions
│   ├── utils/                   # Utility functions
│   └── server.js                # Express server setup
└── public/                      # Static assets
```

---

## 🔐 Authentication System

### JWT-Based Authentication Flow
```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### User Registration with Email Verification
```javascript
// Two-step registration process:
// 1. User submits registration form
// 2. OTP sent to college email (@klu.ac.in)
// 3. Email verification required before account activation

// backend/routes/auth.js - Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, userType, department, year, section } = req.body;
  
  // Validate college email domain
  if (!email.endsWith('@klu.ac.in')) {
    return res.status(400).json({ message: 'Please use your college email' });
  }
  
  // Generate OTP and send email
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendVerificationEmail(email, name, otp);
  
  // Store user with unverified status
  const user = new User({ ...userData, otp, isEmailVerified: false });
  await user.save();
});
```

---

## 📊 Database Models & Schema Design

### User Model (MongoDB Schema)
```javascript
// backend/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  userType: { type: String, enum: ['student', 'organizer'], required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  phone: String,
  isEmailVerified: { type: Boolean, default: false },
  isClubVerified: { type: Boolean, default: false }, // For organizers
  otp: String,
  otpExpires: Date
});
```

### Event Model with Complex Registration System
```javascript
// backend/models/Event.js
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'competition'] 
  },
  
  // Dynamic Registration Form
  registrationForm: {
    fields: [{
      id: Number,
      type: { type: String, enum: ['text', 'email', 'tel', 'select', 'radio', 'checkbox', 'textarea', 'file', 'date'] },
      label: String,
      required: Boolean,
      options: [String] // For select/radio/checkbox
    }]
  },
  
  // Payment Integration
  paymentRequired: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 },
  paymentQR: String, // QR code image for payments
  
  // Registration Tracking
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formData: { type: Map, of: mongoose.Schema.Types.Mixed }, // Dynamic form data
    paymentScreenshot: String,
    paymentStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    registrationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    registeredAt: { type: Date, default: Date.now }
  }],
  
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  isPublished: { type: Boolean, default: false }
});
```

---

## 🎯 Frontend Architecture

### React Context for State Management
```javascript
// src/context/AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Component Architecture - Event Management
```javascript
// src/App.js - Main Dashboard Component
const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const { user, logout } = useAuth();

  // Fetch events with authentication
  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEvents(response.data);
  };

  // Event registration with custom form data
  const registerForEvent = async (eventId) => {
    const registrationData = {
      formData: {
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
        section: user.section
      }
    };

    await axios.post(`${API_BASE_URL}/events/${eventId}/register`, registrationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  return (
    <div className="App">
      <Header user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'events' && <EventsSection events={events} onRegister={registerForEvent} />}
      {activeTab === 'my-events' && <MyEventsSection user={user} />}
      {activeTab === 'clubs' && <ClubsSection />}
      {activeTab === 'profile' && <ProfileSection user={user} />}
    </div>
  );
};
```

---

## 🎨 Advanced Features Implementation

### 1. Dynamic Form Builder for Event Registration
```javascript
// Custom form builder allows organizers to create registration forms
const CreateEventWizard = () => {
  const [formFields, setFormFields] = useState([
    { id: 1, type: 'text', label: 'Full Name', required: true },
    { id: 2, type: 'email', label: 'Email Address', required: true },
    { id: 3, type: 'tel', label: 'Phone Number', required: true }
  ]);

  const addField = (fieldType) => {
    const newField = {
      id: Date.now(),
      type: fieldType,
      label: `New ${fieldType} Field`,
      required: false,
      options: fieldType === 'select' ? ['Option 1', 'Option 2'] : []
    };
    setFormFields([...formFields, newField]);
  };

  return (
    <div className="form-builder">
      <div className="field-types">
        {['text', 'email', 'tel', 'select', 'radio', 'checkbox', 'textarea', 'file', 'date'].map(type => (
          <button key={type} onClick={() => addField(type)}>
            Add {type} Field
          </button>
        ))}
      </div>
      
      <div className="form-preview">
        {formFields.map(field => (
          <FormFieldPreview key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
};
```

### 2. Application Management System
```javascript
// Organizers can view and manage event applications
const OrganizerMyEvents = () => {
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);

  const handleViewApplications = async (event) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/events/${event._id}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setApplications(response.data);
    setShowApplications(true);
  };

  const handleApplicationAction = async (applicationId, action) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_BASE_URL}/events/${selectedEvent._id}/applications/${applicationId}`,
      { registrationStatus: action },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Refresh applications and send email notification
    handleViewApplications(selectedEvent);
    alert(`Application ${action} successfully!`);
  };

  return (
    <div>
      {/* Event cards with application counts */}
      {myEvents.map(event => (
        <div key={event._id} className="event-card">
          <h3>{event.name}</h3>
          <p>{event.registrations?.length || 0} applications</p>
          <button onClick={() => handleViewApplications(event)}>
            View Applications
          </button>
        </div>
      ))}

      {/* Applications Modal */}
      {showApplications && (
        <div className="modal-overlay">
          <div className="applications-modal">
            {applications.map(application => (
              <div key={application._id} className="application-card">
                <h4>{application.user?.name}</h4>
                <p>Status: {application.registrationStatus}</p>
                <button onClick={() => handleApplicationAction(application._id, 'approved')}>
                  Approve
                </button>
                <button onClick={() => handleApplicationAction(application._id, 'rejected')}>
                  Reject
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. Email Notification System
```javascript
// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendApplicationStatusEmail = async (email, name, eventName, status, eventDate, venue) => {
  const statusMessages = {
    approved: {
      subject: '🎉 Application Approved - You\'re In!',
      message: `Great news! Your application for "${eventName}" has been approved.`,
      color: '#10b981'
    },
    rejected: {
      subject: '📝 Application Update',
      message: `Thank you for your interest in "${eventName}". Unfortunately, your application was not selected this time.`,
      color: '#ef4444'
    }
  };

  const { subject, message, color } = statusMessages[status];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center;">
        <h1 style="color: white; margin: 0;">Vivento</h1>
        <p style="color: white; margin: 0.5rem 0 0 0;">Campus Events Platform</p>
      </div>
      
      <div style="padding: 2rem; background: white;">
        <h2 style="color: ${color};">${subject}</h2>
        <p>Dear ${name},</p>
        <p>${message}</p>
        
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
          <h3 style="margin: 0 0 1rem 0; color: #1e293b;">Event Details:</h3>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> ${venue}</p>
        </div>
        
        ${status === 'approved' ? `
          <div style="background: #d1fae5; padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46;"><strong>Next Steps:</strong></p>
            <ul style="color: #065f46; margin: 0.5rem 0 0 0;">
              <li>Mark your calendar for the event date</li>
              <li>Check your email for any additional instructions</li>
              <li>Arrive 15 minutes early on the event day</li>
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: htmlContent
  });
};
```

---

## 🎨 CSS Architecture & Responsive Design

### Professional Theme Implementation
```css
/* src/App.css - Professional color palette */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --background-color: #f1f5f9;
  --card-background: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

/* Mobile-first responsive design */
.events-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Professional card design */
.event-card {
  background: var(--card-background);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## 🔧 API Architecture & Backend Routes

### RESTful API Design
```javascript
// backend/routes/events.js - Event management endpoints

// GET /api/events - Get all published events
router.get('/', auth, async (req, res) => {
  const { category, college, search } = req.query;
  let filter = { isPublished: true, isActive: true };
  
  // Dynamic filtering
  if (category && category !== 'all') filter.category = category;
  if (college && college !== 'all') filter.collegeName = college;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .populate('club', 'name')
    .sort({ date: 1 });
    
  res.json(events);
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', auth, async (req, res) => {
  const { formData, paymentScreenshot } = req.body;
  const event = await Event.findById(req.params.id);
  
  // Check if already registered
  const existingRegistration = event.registrations.find(
    reg => reg.user.toString() === req.user._id.toString()
  );
  
  if (existingRegistration) {
    return res.status(400).json({ message: 'Already registered' });
  }
  
  // Add registration
  event.registrations.push({
    user: req.user._id,
    formData: new Map(Object.entries(formData)),
    paymentScreenshot,
    registrationStatus: 'pending'
  });
  
  await event.save();
  res.json({ message: 'Registration successful' });
});

// GET /api/events/:id/applications - Get event applications (organizers only)
router.get('/:id/applications', [auth, organizerAuth], async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('registrations.user', 'name email');
    
  // Verify organizer owns this event
  if (event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(event.registrations);
});

// PUT /api/events/:eventId/applications/:applicationId - Update application status
router.put('/:eventId/applications/:applicationId', [auth, organizerAuth], async (req, res) => {
  const { registrationStatus } = req.body;
  const event = await Event.findById(req.params.eventId)
    .populate('registrations.user', 'name email');
    
  const registration = event.registrations.id(req.params.applicationId);
  registration.registrationStatus = registrationStatus;
  
  await event.save();
  
  // Send email notification
  await sendApplicationStatusEmail(
    registration.user.email,
    registration.user.name,
    event.name,
    registrationStatus,
    event.date,
    event.venue
  );
  
  res.json({ message: `Application ${registrationStatus} successfully` });
});
```

---

## 🚀 Key Technical Achievements

### 1. **Scalable Architecture**
- Modular component structure for easy maintenance
- Separation of concerns between frontend and backend
- RESTful API design following industry standards

### 2. **Security Implementation**
- JWT-based authentication with token expiration
- Password hashing using bcrypt
- Input validation and sanitization
- CORS configuration for cross-origin requests

### 3. **User Experience Features**
- Real-time status updates
- Responsive design for all devices
- Professional UI with consistent design language
- Loading states and error handling

### 4. **Advanced Functionality**
- Dynamic form builder for custom registration forms
- Payment integration with QR code support
- Email notification system with HTML templates
- Application management with approval workflow

### 5. **Database Optimization**
- Efficient MongoDB queries with population
- Indexing for better performance
- Virtual fields for computed values
- Proper data relationships and references

---

## 📱 Mobile Responsiveness

### Responsive Design Strategy
```css
/* Mobile-first approach */
.container {
  padding: 1rem;
}

.header {
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
  
  .header {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* Touch-friendly buttons */
.btn {
  min-height: 44px; /* iOS recommended touch target */
  padding: 0.75rem 1.5rem;
}

/* Responsive navigation */
.nav-tabs {
  overflow-x: auto;
  white-space: nowrap;
}

.nav-tab {
  flex-shrink: 0;
  min-width: 120px;
}
```

---

## 🔄 State Management Flow

### Authentication Flow
1. User submits login credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. AuthContext updates global state
5. Protected routes check authentication status
6. API requests include Authorization header

### Event Registration Flow
1. Student views available events
2. Clicks register button
3. Custom registration form appears
4. Form data submitted to backend
5. Registration stored with 'pending' status
6. Organizer receives notification
7. Organizer approves/rejects application
8. Email notification sent to student
9. Student sees updated status in My Events

This comprehensive architecture demonstrates modern web development practices with React.js, Node.js, and MongoDB, creating a scalable and maintainable campus events management platform.