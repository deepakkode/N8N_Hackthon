# Complete Setup Instructions for College Events Dashboard

## 🚀 Quick Start Guide

This repository contains a complete college events management system with modern UI and MySQL database integration.

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** (v8.0 or higher)
3. **Git**

### 📁 Project Structure

```
├── backend/          # Node.js/Express backend
├── src/             # React frontend
├── public/          # Static files
└── database/        # Database setup files
```

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/deepakkode/N8N_Hackthon.git
cd N8N_Hackthon
```

### 2. Database Setup

#### Option A: Use Existing Database (Recommended)
The project is configured to use the existing `vivento_events` database with the following credentials:
- **Host:** localhost
- **Port:** 3306
- **Database:** vivento_events
- **User:** root
- **Password:** 143@Nellore

#### Option B: Create New Database
If you want to create your own database:

1. Open MySQL Workbench or command line
2. Create a new database:
   ```sql
   CREATE DATABASE your_database_name;
   ```
3. Update `backend/.env` file with your database credentials

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# The .env file is already included with database configuration
# Update email credentials if needed:
# - EMAIL_USER: your-email@gmail.com
# - EMAIL_PASS: your-app-password
# - BREVO_SMTP_KEY: your-brevo-key (optional)

# Start the backend server
npm start
```

The backend will run on **http://localhost:5007**

### 4. Frontend Setup

```bash
# Navigate to project root (if in backend directory)
cd ..

# Install dependencies
npm install

# Start the frontend
npm start
```

The frontend will run on **http://localhost:3000** (or next available port)

## 🔧 Configuration Details

### Backend Configuration (`backend/.env`)

```env
PORT=5007
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vivento_events
DB_USER=root
DB_PASSWORD=143@Nellore
JWT_SECRET=college-events-super-secret-jwt-key-2026
NODE_ENV=development

# Email Configuration (Update with your credentials)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@vivento.com

# College Configuration
COLLEGE_DOMAIN=klu.ac.in
COLLEGE_NAME=KL University
```

### Frontend Configuration

The frontend is automatically configured to connect to `http://localhost:5007/api`

## 🎨 Features Included

### ✅ Modern UI Components
- **Glassmorphism Design**: Modern glass-like interface
- **Professional Icons**: SVG icons instead of emojis
- **Responsive Layout**: Works on all device sizes
- **Consistent Styling**: Unified design across all pages

### ✅ Complete Functionality
- **User Authentication**: Login/Register with email verification
- **Event Management**: Create, view, and manage events
- **Club Management**: Create and manage clubs
- **Registration System**: Event registration with approval workflow
- **Profile Management**: User profiles with real statistics
- **Dashboard**: Separate dashboards for students and organizers

### ✅ Database Integration
- **MySQL Database**: Fully integrated with Sequelize ORM
- **Auto-sync**: Database tables created automatically
- **Demo Data**: Fallback demo data when API is unavailable

## 🚀 Recent Updates

### UI Improvements
- ✅ Fixed clubs page display issues
- ✅ Enhanced event cards with proper layout and registration options
- ✅ Updated profile page to use real API data
- ✅ Consistent modern interface across all pages
- ✅ Professional appearance with SVG icons

### Technical Fixes
- ✅ Resolved CORS issues
- ✅ Fixed port conflicts (backend now on 5007)
- ✅ Enhanced error handling with demo data fallbacks
- ✅ Improved component structure and reusability

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 5007
   - Check that frontend API config points to correct port

2. **Database Connection Issues**
   - Verify MySQL is running
   - Check database credentials in `backend/.env`
   - Ensure database `vivento_events` exists

3. **Port Already in Use**
   - Backend: Change PORT in `backend/.env`
   - Frontend: React will automatically suggest next available port

4. **Email Service Issues**
   - Update email credentials in `backend/.env`
   - For testing, you can use the bypass OTP: `123456`

## 📱 Usage Guide

### For Students
1. Register with college email (@klu.ac.in)
2. Verify email with OTP
3. Browse and register for events
4. View registered events in "My Events"
5. Join clubs and view profile statistics

### For Organizers
1. Register as organizer
2. Create and manage events
3. View event applications and approve/reject
4. Create clubs (requires faculty verification)
5. Monitor event statistics

## 🤝 Collaboration

This setup ensures both team members can work with the same database and configuration:

1. **Shared Database**: Both use `vivento_events` database
2. **Consistent Configuration**: Same ports and settings
3. **Complete Codebase**: All files included for immediate setup
4. **Demo Data**: Fallback data ensures UI works even without API

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify database connection
4. Check console for error messages

---

**Happy Coding! 🎉**