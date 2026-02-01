# 🚀 Quick Setup Guide for Team Members

## ⚠️ **If you're getting MySQL or Email errors after `git pull`**

### **Step 1: Configure Your Database**

#### **Option A: Use Your Own MySQL Password**
1. Open `backend/.env` file
2. Change this line:
   ```
   DB_PASSWORD=143@Nellore
   ```
   To your MySQL root password:
   ```
   DB_PASSWORD=your_mysql_password_here
   ```

#### **Option B: Create New MySQL User (Recommended)**
```sql
-- Open MySQL Command Line or MySQL Workbench
-- Run these commands:

CREATE USER 'vivento_user'@'localhost' IDENTIFIED BY 'vivento123';
GRANT ALL PRIVILEGES ON *.* TO 'vivento_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/.env`:
```
DB_USER=vivento_user
DB_PASSWORD=vivento123
```

### **Step 2: Initialize Database**
```bash
cd backend
node scripts/init-database.js --with-test-data
```

### **Step 3: Fix Email Configuration (Optional)**
The app will work without email, but if you want to test email features:

1. **For Gmail:**
   - Enable 2-factor authentication
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Update `backend/.env`:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-digit-app-password
   ```

2. **For Brevo (Optional):**
   - Sign up at https://brevo.com
   - Get SMTP credentials
   - Update `backend/.env`:
   ```
   BREVO_SMTP_USER=your-email@gmail.com
   BREVO_SMTP_KEY=your-brevo-api-key
   ```

### **Step 4: Restart Everything**
```bash
# Stop all servers (Ctrl+C)

# Clear cache and reinstall
rm -rf node_modules package-lock.json
cd backend && rm -rf node_modules package-lock.json && cd ..
npm install
cd backend && npm install && cd ..

# Start backend
cd backend && npm start

# In another terminal, start frontend
npm start
```

## 🎯 **Quick Test Setup (Skip Email)**

If you just want to test the app quickly:

1. **Update `backend/.env`** with your MySQL password only:
   ```
   DB_PASSWORD=your_mysql_password
   ```

2. **Run database setup:**
   ```bash
   cd backend
   node scripts/init-database.js --with-test-data
   ```

3. **Start servers:**
   ```bash
   # Terminal 1:
   cd backend && npm start
   
   # Terminal 2:
   npm start
   ```

4. **Test login:**
   - Email: `student@test.com`
   - Password: `password123`

## 🔍 **Common Issues:**

### **MySQL Issues:**
- **Error**: `Access denied for user 'root'@'localhost'`
- **Solution**: Update `DB_PASSWORD` in `backend/.env` with your MySQL password

### **Email Issues:**
- **Error**: `Authentication failed: 535 5.7.8`
- **Solution**: The app works without email! Email is only for OTP verification (uses bypass OTP: 123456)

### **Port Issues:**
- **Error**: `Port 5007 is already in use`
- **Solution**: Change `PORT=5008` in `backend/.env`

## ✅ **Success Indicators:**
When everything works, you should see:
```
🚀 Server running on port 5007
✅ MySQL connected successfully
📧 Email service: ✅ Configured
✅ Database synced successfully
```

## 🆘 **Still Having Issues?**

1. **Check MySQL is running:**
   ```bash
   # Windows:
   net start mysql
   
   # Mac:
   brew services start mysql
   
   # Linux:
   sudo systemctl start mysql
   ```

2. **Reset MySQL password:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   ```

3. **Use test database:**
   ```
   DB_NAME=test
   ```

---

**The app will work perfectly even without email configuration! 🎉**