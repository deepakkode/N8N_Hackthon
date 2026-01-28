# Vivento - Campus Events Platform

A comprehensive web application for managing college events, clubs, and student participation. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## 🌟 Features Overview

### 🔐 Authentication System
- **Dual User Types**: Students and Event Organizers
- **College Email Verification**: Restricted to @klu.ac.in domain
- **OTP Email Verification**: Secure email verification using Gmail SMTP
- **JWT Token Authentication**: Secure session management
- **Password Encryption**: bcrypt for secure password hashing

### 👥 User Management
- **Student Registration**: Year, department, section tracking
- **Organizer Registration**: Enhanced profile for event management
- **Profile Management**: Editable profiles with statistics
- **Profile Pictures**: Upload and manage profile images
- **Social Links**: Add social media profiles

### 🏛️ Club Management System
- **Club Creation**: Organizers can create and manage clubs
- **Two-Step Verification**:
  - Organizer email verification
  - Faculty advisor OTP verification
- **Faculty Integration**: Faculty advisor approval system
- **Club Dashboard**: Browse and explore verified clubs
- **Club-Event Association**: Events linked to verified clubs

### 🎉 Event Management

#### For Organizers:
- **Multi-Step Event Creation Wizard**:
  - Step 1: Basic event details (name, description, venue, date, time)
  - Step 2: Custom registration form builder
  - Step 3: Payment setup and event publishing
- **Custom Registration Forms**: 10+ field types including text, email, phone, select, radio, checkbox, textarea, file upload, date
- **Payment Integration**: QR code payment with screenshot verification
- **Application Management**: Review, approve, or reject registrations
- **Event Analytics**: Track applications, participants, and statistics
- **Email Notifications**: Automated status updates to applicants

#### For Students:
- **Event Discovery**: Browse all published events
- **Advanced Filtering**: By category, college, search terms
- **Event Registration**: Apply with custom forms and payment
- **Application Tracking**: Monitor application status
- **My Events Dashboard**: Track registered and participated events

### 📧 Email Notification System
- **Registration Confirmations**: Welcome emails for new users
- **OTP Delivery**: Email verification codes
- **Faculty Notifications**: Club verification requests
- **Application Status Updates**: Approval/rejection notifications
- **Event Reminders**: Automated reminders (7 days, 3 days, 1 day, day of event)
- **Professional Templates**: Branded email templates

### 📊 Dashboard & Analytics

#### Student Dashboard:
- **Event Statistics**: Total events, registrations, participations
- **Quick Actions**: Register for events, view applications
- **Event Calendar**: Upcoming events overview
- **Achievement Tracking**: Participation history

#### Organizer Dashboard:
- **Event Management**: Create, edit, manage events
- **Application Overview**: Pending approvals, participant counts
- **Club Statistics**: Member count, event count
- **Revenue Tracking**: Payment collection overview

### 🎨 User Interface
- **Professional Design**: Clean, modern interface
- **Mobile Responsive**: Optimized for all device sizes
- **Dark/Light Theme**: Professional color scheme
- **Intuitive Navigation**: Easy-to-use interface
- **Interactive Components**: Smooth user experience
- **SVG Icons**: Professional iconography

### 🔧 Technical Features
- **Real-time Updates**: Live data synchronization
- **File Upload**: Image handling for posters and profiles
- **Search Functionality**: Advanced search and filtering
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Graceful error management
- **Security**: Protected routes and data sanitization

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern JavaScript framework
- **Context API**: State management
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with responsive design
- **JavaScript ES6+**: Modern JavaScript features

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Nodemailer**: Email service integration
- **node-cron**: Scheduled tasks for reminders

### Database Schema
- **Users**: Student and organizer profiles
- **Events**: Event details with custom forms
- **Clubs**: Club information and verification
- **Registrations**: Event applications and status

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account for email service

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/deepakkode/N8N_Hackthon.git
   cd N8N_Hackthon
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Configuration**
   
   Create `backend/.env` file:
   ```env
   PORT=5002
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # Email Configuration
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM=Vivento Events <your_gmail_address>
   
   # College Configuration
   COLLEGE_DOMAIN=klu.ac.in
   COLLEGE_NAME=KL University
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend (from root directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3010
   - Backend API: http://localhost:5002

## 🌐 Deployment

### Quick Deployment
```bash
# Build for production
./deploy.sh
```

### Manual Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- **Frontend**: Netlify
- **Backend**: Render.com
- **Database**: MongoDB Atlas (already configured)

### Repository
- **GitHub**: https://github.com/deepakkode/N8N_Hackthon.git

### Live Demo (After Deployment)
- **Frontend**: https://vivento-campus-events.netlify.app
- **Backend API**: https://vivento-backend.onrender.com

## 📱 User Workflows

### Student Journey
1. **Registration**: Sign up with college email
2. **Email Verification**: Verify account with OTP
3. **Profile Setup**: Complete profile information
4. **Browse Events**: Explore available events
5. **Event Registration**: Apply for events with custom forms
6. **Payment**: Submit payment proof if required
7. **Track Applications**: Monitor approval status
8. **Participate**: Attend approved events

### Organizer Journey
1. **Registration**: Sign up as event organizer
2. **Email Verification**: Verify account with OTP
3. **Club Creation**: Create and describe club
4. **Faculty Verification**: Get faculty advisor approval
5. **Event Creation**: Use wizard to create events
6. **Form Building**: Design custom registration forms
7. **Payment Setup**: Configure payment requirements
8. **Application Management**: Review and approve registrations
9. **Event Execution**: Manage event day activities

## 🔒 Security Features
- **Email Domain Validation**: Restricted to college domain
- **JWT Authentication**: Secure token-based auth
- **Password Encryption**: bcrypt hashing
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling
- **Data Sanitization**: XSS protection

## 📈 Scalability Features
- **Modular Architecture**: Component-based design
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Efficient data retrieval
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Response time tracking

## 🧪 Testing

### Test Accounts
- **Student**: `test@klu.ac.in` / `123456`
- **Organizer**: `99240041367@klu.ac.in` / `123456`

### Development Features
- **OTP Bypass**: Use `123456` for testing
- **Test User Creation**: Automated test account setup
- **Debug Logging**: Comprehensive logging system

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get published events
- `POST /api/events` - Create event (organizers)
- `PUT /api/events/:id/form` - Update registration form
- `PUT /api/events/:id/payment` - Update payment details
- `POST /api/events/:id/register` - Register for event

### Clubs
- `POST /api/clubs/create` - Create club
- `POST /api/clubs/verify-faculty` - Faculty verification
- `GET /api/clubs` - Get verified clubs

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team
- **Frontend Development**: React.js with modern UI/UX
- **Backend Development**: Node.js/Express with MongoDB
- **Email Integration**: Nodemailer with Gmail SMTP
- **Authentication**: JWT with bcrypt encryption

## 🆘 Support
For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added email notifications and reminders
- **v1.2.0**: Enhanced UI/UX and mobile responsiveness
- **v1.3.0**: Added profile management and analytics

---

**Vivento** - Transforming campus event management with modern technology and user-centric design.