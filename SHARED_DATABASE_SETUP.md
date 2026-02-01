# 🌐 Shared Database Setup Guide

## 🎯 Goal: Same Database for All Team Members

Instead of each person having their own local database, we'll use a **shared cloud database** that everyone can access.

## 🚀 **Option 1: Free Cloud Database (Recommended)**

### **Step 1: Create Free MySQL Database**

#### **A. Using PlanetScale (Recommended - Free)**
1. Go to https://planetscale.com/
2. Sign up with GitHub account
3. Create new database: `vivento-events`
4. Get connection details

#### **B. Using Railway (Alternative - Free)**
1. Go to https://railway.app/
2. Sign up with GitHub
3. Create new project → Add MySQL
4. Get connection details

#### **C. Using Aiven (Alternative - Free)**
1. Go to https://aiven.io/
2. Sign up for free account
3. Create MySQL service
4. Get connection details

### **Step 2: Update Environment Configuration**

Create a **shared `.env` file** that everyone will use:

```env
# Shared Cloud Database Configuration
PORT=5007
DB_HOST=your-cloud-db-host.com
DB_PORT=3306
DB_NAME=vivento_events
DB_USER=your-cloud-db-user
DB_PASSWORD=your-cloud-db-password
JWT_SECRET=college-events-super-secret-jwt-key-2026
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@vivento.com

# College Configuration
COLLEGE_DOMAIN=klu.ac.in
COLLEGE_NAME=KL University
```

### **Step 3: Initialize Shared Database**
```bash
# Only ONE person needs to do this (usually the project owner)
cd backend
node scripts/init-database.js --with-test-data
```

### **Step 4: Share Configuration with Team**
1. Update the `.env` file in your repository
2. Commit and push changes
3. Team members pull and use the same database

---

## 🏠 **Option 2: Local Network Database**

If you prefer to keep the database on your laptop and let others access it:

### **Step 1: Configure MySQL for Network Access**

#### **On Your Laptop (Database Host):**

1. **Edit MySQL Configuration:**
   ```bash
   # Windows: Edit C:\ProgramData\MySQL\MySQL Server 8.0\my.ini
   # Mac: Edit /usr/local/etc/my.cnf
   # Linux: Edit /etc/mysql/mysql.conf.d/mysqld.cnf
   
   # Add or modify:
   bind-address = 0.0.0.0
   ```

2. **Restart MySQL Service:**
   ```bash
   # Windows:
   net stop mysql && net start mysql
   
   # Mac:
   brew services restart mysql
   
   # Linux:
   sudo systemctl restart mysql
   ```

3. **Create Network User:**
   ```sql
   CREATE USER 'vivento_remote'@'%' IDENTIFIED BY 'vivento123';
   GRANT ALL PRIVILEGES ON vivento_events.* TO 'vivento_remote'@'%';
   FLUSH PRIVILEGES;
   ```

4. **Get Your IP Address:**
   ```bash
   # Windows:
   ipconfig
   
   # Mac/Linux:
   ifconfig
   ```
   Look for your local IP (usually 192.168.x.x)

### **Step 2: Team Members Configuration**

#### **Friend's `.env` file:**
```env
PORT=5007
DB_HOST=192.168.1.100  # Your laptop's IP address
DB_PORT=3306
DB_NAME=vivento_events
DB_USER=vivento_remote
DB_PASSWORD=vivento123
JWT_SECRET=college-events-super-secret-jwt-key-2026
NODE_ENV=development
```

---

## 🔧 **Option 3: Docker Shared Database**

### **Step 1: Create Docker Compose File**
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: vivento_mysql
    environment:
      MYSQL_ROOT_PASSWORD: vivento123
      MYSQL_DATABASE: vivento_events
      MYSQL_USER: vivento_user
      MYSQL_PASSWORD: vivento123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - vivento_network

volumes:
  mysql_data:

networks:
  vivento_network:
    driver: bridge
```

### **Step 2: Start Shared Database**
```bash
# Start database
docker-compose up -d

# Initialize database
cd backend
node scripts/init-database.js --with-test-data
```

### **Step 3: Everyone Uses Same Configuration**
```env
DB_HOST=localhost  # or your-laptop-ip
DB_PORT=3306
DB_NAME=vivento_events
DB_USER=vivento_user
DB_PASSWORD=vivento123
```

---

## 🎯 **Recommended Approach: Cloud Database**

### **Quick Setup with PlanetScale:**

1. **Create Account:** https://planetscale.com/
2. **Create Database:** `vivento-events`
3. **Get Connection String:** 
   ```
   mysql://username:password@host:port/database?sslaccept=strict
   ```
4. **Update `.env`:**
   ```env
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_NAME=vivento-events
   DB_USER=your-username
   DB_PASSWORD=your-password
   ```

### **Benefits:**
- ✅ **Always Synchronized**: Same data for everyone
- ✅ **No Network Issues**: Works from anywhere
- ✅ **Free Tier Available**: No cost for development
- ✅ **Automatic Backups**: Data is safe
- ✅ **Easy Setup**: No complex configuration

---

## 🚀 **Implementation Steps:**

### **For You (Project Owner):**
1. Set up cloud database
2. Update `.env` with cloud database credentials
3. Initialize database with test data
4. Commit and push changes

### **For Your Friend:**
1. Pull latest changes
2. The `.env` file now has cloud database settings
3. No local MySQL setup needed
4. Start the application

### **Result:**
- Both laptops connect to the same cloud database
- All users, events, and data are shared
- Real-time synchronization
- No local database setup required

Would you like me to help you set up the **cloud database option**? It's the easiest and most reliable solution! 🌟