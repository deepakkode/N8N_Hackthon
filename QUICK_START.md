# 🚀 Quick Start Guide

## For Your Friend - Simple 3-Step Setup

### Step 1: Prerequisites Check ✅
1. **MySQL is installed and running**
   - Open Windows Services (Win + R → `services.msc`)
   - Find "MySQL80" service and make sure it's "Running"
   - If not running, right-click → Start

2. **Node.js is installed**
   - Open command prompt and type: `node --version`
   - Should show version 16 or higher

### Step 2: Start Backend Server 🔧
1. **Double-click `start-backend.bat`** (easier option)
   
   OR manually:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Wait for success message:**
   ```
   🚀 Server running on port 5007
   📊 Database tables synchronized successfully
   ```

3. **Keep this terminal window open!**

### Step 3: Start Frontend 🎨
1. **Open a NEW command prompt/terminal**
2. **Double-click `start-frontend.bat`** (easier option)
   
   OR manually:
   ```bash
   npm install
   npm start
   ```

3. **Browser should open automatically** to http://localhost:3000

## ✅ Success Indicators

**Backend Terminal Should Show:**
```
🚀 Server running on port 5007
📊 Database tables synchronized successfully
📧 Email service: ✅ Ready
```

**Frontend Browser Should Show:**
- Login/Register page
- No connection errors in browser console

## ❌ If You See Errors

### "net::ERR_CONNECTION_REFUSED"
- Backend is not running
- Go back to Step 2 and start backend first

### "EADDRINUSE" Port Error
- Port 5007 is already in use
- Close any other running applications
- Or restart your computer

### Database Connection Error
- MySQL is not running
- Check Windows Services for MySQL80
- Restart MySQL service

## 🆘 Emergency Reset

If nothing works:
1. Close all terminals
2. Restart your computer
3. Start MySQL service
4. Follow steps 2 and 3 again

## 📞 Need Help?

Check the detailed `SETUP_INSTRUCTIONS.md` file for more troubleshooting options.

---
**Remember: Backend FIRST, then Frontend!** 🔄