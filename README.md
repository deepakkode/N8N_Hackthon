# Smart Event Registration and Auto-Communication System

A comprehensive web-based platform designed for colleges and universities to manage event lifecycle from creation to completion with automated communications and payment processing.

## 🎯 Project Overview

The Smart Event Registration and Auto-Communication System is a centralized platform that enables:
- **Student Organizers** to create and manage events for different clubs
- **Faculty Members** to approve events through dual verification
- **Students** to discover and register for approved events
- **Automated Email System** for confirmations, reminders, and follow-ups
- **Payment Processing** with QR code integration and manual verification
- **Comprehensive Dashboards** for all user roles with reporting and analytics

## 🏗️ Architecture

**3-Tier Architecture:**
- **Frontend**: React (JavaScript) - Responsive design for web and mobile
- **Backend**: Node.js with Express framework
- **Database**: PostgreSQL with raw SQL queries
- **Database Management**: pgAdmin 4

## 👥 User Roles

### 🎓 Student
- View approved events
- Register for events online
- Upload payment proofs for paid events
- Receive automated email notifications
- Cancel registrations

### 🎪 Organizer (Student with additional permissions)
- Create and manage events
- Upload payment QR codes
- Verify payment proofs
- Export participant lists (Excel/PDF)
- View event analytics and revenue

### 👨‍🏫 Faculty
- Approve or reject events
- Generate comprehensive reports
- Monitor system activity
- Access analytics dashboard

### 🛡️ Admin
- Manage users and clubs
- Block/unblock accounts
- Monitor system activity logs
- System configuration

## ✨ Key Features

### 🔐 Authentication & Security
- College email verification with OTP
- Role-based access control
- Dual verification system (Student + Faculty)
- Activity logging and fraud prevention
- Secure session management with JWT

### 📧 Auto-Communication System
- **Confirmation Emails**: Instant registration confirmation
- **Reminder Emails**: 24-hour event reminders
- **Follow-up Emails**: Post-event feedback collection
- **Notification Emails**: Event approvals/rejections
- Retry logic with exponential backoff

### 💳 Payment Processing
- QR code upload for UPI payments
- Payment proof verification workflow
- Manual payment verification by organizers
- Revenue tracking and reporting
- Early bird discount support

### 📊 Reporting & Analytics
- Participant lists (Excel/PDF export)
- Event statistics and trends
- Payment status tracking
- User engagement analytics
- Visual charts and graphs

### 📱 Responsive Design
- Mobile-first approach
- Cross-browser compatibility
- Intuitive user interface
- Accessibility features

## 🛠️ Technology Stack

### Frontend
- **React** (JavaScript)
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with responsive design
- **Chart.js** for analytics

### Backend
- **Node.js** with **Express.js**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemailer** for email service
- **Helmet** for security headers
- **Rate limiting** for API protection

### Database
- **PostgreSQL** with connection pooling
- **pg (node-postgres)** library
- Raw SQL queries for optimal performance
- **pgAdmin 4** for database management

### Development Tools
- **Git** for version control
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest** for testing

## 📋 Database Schema

### Core Tables
- **users**: User authentication and profile data
- **clubs**: College clubs and organizations
- **events**: Event details and status management
- **registrations**: Event registrations and payment tracking
- **email_logs**: Email delivery tracking and retry logic
- **otp_verifications**: OTP management for email verification
- **activity_logs**: Security and audit logging
- **feedback**: Event feedback and ratings

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- pgAdmin 4
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/deepakkode/N8N_Hackthon.git
   cd N8N_Hackthon
   ```

2. **Set up the database**
   - Install PostgreSQL and pgAdmin 4
   - Create a new database for the project
   - Run the database schema scripts

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm start
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```



## 🔄 Workflow

### Event Creation Flow
1. **Organizer** creates event with details and payment settings
2. **System** saves event in pending status
3. **Faculty** receives notification for approval
4. **Faculty** approves/rejects with optional comments
5. **Approved events** become visible to students
6. **Students** can register and make payments
7. **Automated emails** sent throughout the process

### Payment Verification Flow
1. **Student** registers for paid event
2. **System** displays QR code and payment instructions
3. **Student** makes payment and uploads proof
4. **Organizer** verifies payment proof
5. **System** updates registration status and sends confirmation

## 🧪 Testing

### Property-Based Testing
The system includes comprehensive property-based tests that validate:
- Authentication and authorization workflows
- Email delivery and retry mechanisms
- Payment processing integrity
- Data validation and security
- Cross-platform compatibility

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

## 📈 Performance & Scalability

- **Response Time**: < 2 seconds under normal load
- **Concurrent Users**: Supports 1000+ simultaneous users
- **Database Optimization**: Proper indexing and connection pooling
- **Horizontal Scaling**: Load balancer ready architecture
- **Caching**: Implemented for frequently accessed data

## 🔒 Security Features

- **Email Verification**: OTP-based college email verification
- **Role-Based Access**: Granular permission system
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: API endpoint protection
- **Activity Logging**: Comprehensive audit trail
- **Secure Sessions**: JWT with expiration
- **HTTPS Enforcement**: Secure communication

## 📊 Monitoring & Analytics

- **Email Delivery Tracking**: Success/failure rates with retry logic
- **User Activity Monitoring**: Login patterns and suspicious behavior
- **Event Analytics**: Registration trends and participation rates
- **Payment Tracking**: Revenue reports and payment status
- **System Performance**: Response times and error rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Deepak Kode**
- GitHub: [@deepakkode](https://github.com/deepakkode)
- Project Link: [https://github.com/deepakkode/N8N_Hackthon](https://github.com/deepakkode/N8N_Hackthon)

## 🙏 Acknowledgments

- Built for college hackathon participation
- Designed to solve real-world event management challenges
- Implements modern web development best practices
- Focuses on user experience and system reliability

---

**🎯 Ready to revolutionize college event management!** 🚀
