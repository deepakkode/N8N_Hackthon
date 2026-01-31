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

### 3. Backend Setup (MUST DO FIRST!)

⚠️ **IMPORTANT: Start the backend server FIRST before starting the frontend!**

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

**✅ You should see:**
```
🚀 Server running on port 5007
📊 Database tables synchronized successfully
📧 Email service: ✅ Ready (or ⚠️ Not configured)
```

**❌ If you see errors:**
- Check if MySQL is running
- Verify database credentials in `backend/.env`
- Ensure port 5007 is not in use

### 4. Frontend Setup (AFTER Backend is Running)

**Open a NEW terminal window/tab** (keep backend running in the first terminal)

```bash
# Navigate to project root (if in backend directory)
cd ..

# Install dependencies
npm install

# Start the frontend
npm start
```

The frontend will run on **http://localhost:3000** (or next available port)

**✅ You should see:**
```
API Base URL: http://localhost:5007/api
Environment: development
```

**❌ If you see connection errors:**
- Make sure backend is running on port 5007
- Check that both terminals are open (backend + frontend)
- Verify API configuration in `src/config/api.js`

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

#### 1. **"net::ERR_CONNECTION_REFUSED" Error**
**Problem:** Frontend can't connect to backend
**Solution:**
```bash
# Check if backend is running
# You should see "🚀 Server running on port 5007" in backend terminal

# If not running:
cd backend
npm start

# If port 5007 is in use:
# Kill the process using port 5007
netstat -ano | findstr :5007
taskkill /PID [PID_NUMBER] /F

# Or change port in backend/.env:
PORT=5008
```

#### 2. **Database Connection Issues**
**Problem:** "Error: connect ECONNREFUSED" or database errors
**Solution:**
```bash
# Check if MySQL is running
# Windows: Open Services and start MySQL80 service
# Or restart MySQL from MySQL Workbench

# Verify database exists:
mysql -u root -p
SHOW DATABASES;
# Should see 'vivento_events' in the list

# If database doesn't exist:
CREATE DATABASE vivento_events;
```

#### 3. **"EADDRINUSE" Port Already in Use**
**Problem:** Port 5007 or 3000 already in use
**Solution:**
```bash
# For backend (port 5007):
netstat -ano | findstr :5007
taskkill /PID [PID_NUMBER] /F

# For frontend (port 3000):
# React will automatically suggest next available port
# Just press 'Y' when prompted
```

#### 4. **Email Service Issues**
**Problem:** Email verification not working
**Solution:**
- Update email credentials in `backend/.env`
- For testing, use bypass OTP: `123456`
- Email service is optional for development

#### 5. **"Module not found" Errors**
**Problem:** Missing dependencies
**Solution:**
```bash
# In backend directory:
cd backend
npm install

# In frontend directory:
cd ..
npm install
```

### 🚨 Quick Fix Checklist

If your friend is getting connection errors, have them check:

1. ✅ **MySQL is running** (check Windows Services)
2. ✅ **Backend terminal is open** and shows "Server running on port 5007"
3. ✅ **Frontend terminal is separate** from backend terminal
4. ✅ **Both npm install completed** without errors
5. ✅ **Database `vivento_events` exists** in MySQL

### 📞 Step-by-Step Debug Process

1. **First, check MySQL:**
   ```bash
   mysql -u root -p143@Nellore
   SHOW DATABASES;
   ```

2. **Then start backend:**
   ```bash
   cd backend
   npm start
   # Wait for "Server running on port 5007"
   ```

3. **Finally start frontend (new terminal):**
   ```bash
   npm start
   # Should connect to backend successfully
   ```

### 🔧 Alternative Solutions

If issues persist:

1. **Use different ports:**
   - Change `PORT=5008` in `backend/.env`
   - Update `src/config/api.js` to use port 5008

2. **Reset everything:**
   ```bash
   # Kill all node processes
   taskkill /f /im node.exe
   
   # Restart MySQL service
   # Then follow setup steps again
   ```

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