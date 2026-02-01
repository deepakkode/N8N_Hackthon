# 🚂 Railway Database Setup (Free & Easy)

## 🎯 **Quick Setup: Shared Database in 5 Minutes**

### **Step 1: Create Free Railway Account**
1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign up with your GitHub account (free)

### **Step 2: Create MySQL Database**
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait for deployment (2-3 minutes)

### **Step 3: Get Database Credentials**
1. Click on your MySQL service
2. Go to "Variables" tab
3. Copy these values:
   - `MYSQL_HOST`
   - `MYSQL_PORT` 
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### **Step 4: Update Your `.env` File**
Replace your current database settings with:

```env
# Railway Cloud Database
PORT=5007
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6543
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your-railway-password
JWT_SECRET=college-events-super-secret-jwt-key-2026
NODE_ENV=development

# Email Configuration (Optional - app works without this)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@vivento.com

# College Configuration
COLLEGE_DOMAIN=klu.ac.in
COLLEGE_NAME=KL University
```

### **Step 5: Initialize Database**
```bash
cd backend
node scripts/init-database.js --with-test-data
```

### **Step 6: Test Connection**
```bash
cd backend
npm start
```

You should see:
```
✅ MySQL connected successfully
✅ Database synced successfully
```

### **Step 7: Share with Team**
1. Commit the updated `.env` file
2. Push to GitHub
3. Your friend pulls and uses the same database!

---

## 🎉 **Benefits:**
- ✅ **Free**: Railway provides free MySQL hosting
- ✅ **Shared**: Both laptops use the same database
- ✅ **Always Online**: Accessible from anywhere
- ✅ **No Setup**: No local MySQL installation needed
- ✅ **Automatic Backups**: Data is safe

## 🔧 **Alternative: Supabase (Also Free)**

If Railway doesn't work, try Supabase:

1. Go to https://supabase.com/
2. Create new project
3. Go to Settings → Database
4. Get connection details
5. Update `.env` with Supabase credentials

---

## 🚨 **Important Notes:**

### **For Security:**
- Don't commit `.env` file with real credentials to public repos
- Use environment variables in production
- Railway free tier has usage limits

### **For Development:**
- This setup is perfect for team development
- All team members see the same data
- Changes are instantly synchronized

### **Database URL Format:**
If Railway gives you a connection URL like:
```
mysql://root:password@containers-us-west-xxx.railway.app:6543/railway
```

Convert it to:
```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6543
DB_USER=root
DB_PASSWORD=password
DB_NAME=railway
```

---

## 🆘 **Troubleshooting:**

### **Connection Issues:**
- Check if Railway service is running
- Verify credentials are correct
- Try restarting Railway service

### **SSL Issues:**
Add to your database config:
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

---

**This is the easiest way to share a database between team members! 🚀**