# MySQL Database Setup Guide

## 📋 Prerequisites

You need to install MySQL Server on your system before running the application.

## 🚀 Installation Options

### Option 1: XAMPP (Recommended for Development)
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP with MySQL component
3. Start XAMPP Control Panel
4. Start MySQL service
5. MySQL will be available at `localhost:3306`
6. Default credentials: `root` with no password

### Option 2: MySQL Server Direct Installation
1. Download MySQL Server from https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server
3. Set up root password during installation
4. Start MySQL service

### Option 3: Docker (For Advanced Users)
```bash
docker run --name mysql-vivento -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=vivento_events -p 3306:3306 -d mysql:8.0
```

## ⚙️ Database Configuration

### 1. Update Environment Variables
Copy `backend/.env.example` to `backend/.env` and update:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vivento_events
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 2. Create Database
Connect to MySQL and create the database:

```sql
CREATE DATABASE vivento_events;
USE vivento_events;
```

### 3. Test Connection
Run the test script to verify everything is working:

```bash
cd backend
node test-mysql.js
```

## 🔧 Troubleshooting

### Connection Refused Error
- **Cause**: MySQL server is not running
- **Solution**: Start MySQL service through XAMPP or system services

### Access Denied Error
- **Cause**: Incorrect username/password
- **Solution**: Update credentials in `.env` file

### Database Does Not Exist Error
- **Cause**: Database not created
- **Solution**: Create database manually or let the app create it

## 📊 Database Schema

The application will automatically create these tables:
- `users` - User accounts (students and organizers)
- `clubs` - Student clubs and organizations
- `events` - Campus events
- `event_registrations` - Event registration data

## 🚀 Running the Application

1. Ensure MySQL is running
2. Update `.env` with correct database credentials
3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
4. The application will automatically create tables on first run

## 📱 Default Test Data

After setup, you can create test accounts through the registration process or use the admin panel to add sample data.

## 🔒 Security Notes

- Change default MySQL root password in production
- Create a dedicated database user for the application
- Use strong passwords for all accounts
- Enable SSL for database connections in production

## 📞 Support

If you encounter issues:
1. Check MySQL service is running
2. Verify database credentials
3. Check firewall settings
4. Review error logs in the console