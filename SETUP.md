# 🚀 Quick Setup Guide for Vivento Campus Events Platform

## Prerequisites
- Node.js (v14+)
- Git

## Setup Steps

### 1. Clone Repository
```bash
git clone https://github.com/deepakkode/N8N_Hackthon.git
cd N8N_Hackthon
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
Create `backend/.env` file:
```env
PORT=5002
MONGODB_URI=mongodb+srv://balayyaj05_db_user:CvzMIAlHI40cGLFQ@cluster0.03sgflx.mongodb.net/college-events?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=college-events-super-secret-jwt-key-2026
NODE_ENV=development

# Email Configuration
EMAIL_USER=kodedeepak40@gmail.com
EMAIL_PASS=lxbifwgdvuumbdtv
EMAIL_FROM=Smart Event Registration <kodedeepak40@gmail.com>

# College Configuration
COLLEGE_DOMAIN=klu.ac.in
COLLEGE_NAME=KL University
```

### 4. Start Application
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd ..
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3010
- **Backend**: http://localhost:5002

## Demo Accounts
- **Student**: `test@klu.ac.in` / `123456`
- **Organizer**: `99240041367@klu.ac.in` / `123456`
- **OTP**: Use `123456` for email verification

## Features to Demo
1. User registration and login
2. Event creation (organizer)
3. Event registration (student)
4. Club creation and verification
5. Profile management
6. Mobile responsive design

That's it! The application should be running locally. 🎉