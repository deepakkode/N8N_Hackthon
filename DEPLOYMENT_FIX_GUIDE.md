# 🚀 Complete Deployment Fix Guide

## 🎯 Current Status
- ✅ **Frontend**: https://creative-scone-3fca73.netlify.app/
- ✅ **Backend**: https://n8n-hackthon-2.onrender.com
- ❌ **Issues**: API URL and CORS errors

## 🔧 Step-by-Step Fix

### **Step 1: Fix Backend Environment Variables (CRITICAL)**

**Go to Render Dashboard:**
1. Visit: https://render.com/dashboard
2. Click on your service: `n8n-hackthon-2`
3. Go to **"Environment"** tab
4. **Add these environment variables** (click "Add Environment Variable" for each):

```env
MONGODB_URI=mongodb+srv://balayyaj05_db_user:CvzMIAlHI40cGLFQ@cluster0.03sgflx.mongodb.net/college-events?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=college-events-super-secret-jwt-key-2026

NODE_ENV=production

EMAIL_USER=kodedeepak40@gmail.com

EMAIL_PASS=lxbifwgdvuumbdtv

EMAIL_FROM=Vivento Events <kodedeepak40@gmail.com>

COLLEGE_DOMAIN=klu.ac.in

COLLEGE_NAME=KL University

FRONTEND_URL=https://creative-scone-3fca73.netlify.app
```

5. **Click "Save Changes"**
6. **Wait for auto-redeploy** (or click "Manual Deploy")

### **Step 2: Fix Frontend API URL**

**Go to Netlify Dashboard:**
1. Visit: https://app.netlify.com/sites/creative-scone-3fca73/overview
2. Go to **"Site settings"** → **"Environment variables"**
3. **Add this environment variable:**

```env
REACT_APP_API_URL=https://n8n-hackthon-2.onrender.com/api
```

4. **Click "Save"**
5. **Redeploy**: Go to "Deploys" → "Trigger deploy" → "Deploy site"

### **Step 3: Update Frontend Build (Alternative)**

If environment variables don't work immediately, **redeploy with updated dist folder:**

1. **Download the updated dist folder** from the repository
2. **Drag and drop** the new dist folder to Netlify
3. **Or connect GitHub** for automatic deployments

## ✅ Verification Steps

### **1. Check Backend API**
Visit: https://n8n-hackthon-2.onrender.com

**Expected Response:**
```json
{"message": "College Events API is running!"}
```

**If you see MongoDB connection error**, the environment variables aren't set correctly.

### **2. Check Frontend**
Visit: https://creative-scone-3fca73.netlify.app/

**Open Browser Console (F12)** and look for:
```
API Base URL: https://n8n-hackthon-2.onrender.com/api
Environment: production
```

**If you still see the old URL**, the frontend needs to be redeployed.

### **3. Test Registration**
1. **Try registering** a new account
2. **Check console** for CORS errors
3. **If CORS errors persist**, verify backend environment variables

## 🔍 Troubleshooting

### **Issue: Still seeing old API URL**
**Solution:** Redeploy frontend with environment variable or new build

### **Issue: CORS errors**
**Solution:** Ensure `FRONTEND_URL` is set correctly in Render backend

### **Issue: MongoDB connection failed**
**Solution:** Verify `MONGODB_URI` is set exactly as shown above

### **Issue: 500 Internal Server Error**
**Solution:** Check Render logs for specific error messages

## 📊 Expected Final State

### **Backend Logs (Render):**
```
Server running on port 10000
MongoDB connected successfully
Event reminder scheduler initialized - will run daily at 9:00 AM IST
```

### **Frontend Console:**
```
API Base URL: https://n8n-hackthon-2.onrender.com/api
Environment: production
```

### **Working Features:**
- ✅ User registration with @klu.ac.in emails
- ✅ Email verification (OTP: 123456 for testing)
- ✅ Login/logout functionality
- ✅ Club creation and verification
- ✅ Event creation and management
- ✅ Event registration

## 🎉 Success Indicators

**You'll know it's working when:**
1. **Backend URL** returns the API message
2. **Frontend console** shows correct API URL
3. **Registration form** submits without CORS errors
4. **Email verification** works (use OTP: 123456)
5. **Dashboard loads** after successful login

## 🆘 If Still Having Issues

1. **Check Render logs** for backend errors
2. **Check Netlify deploy logs** for frontend build issues
3. **Verify environment variables** are exactly as specified
4. **Try manual deploy** on both platforms
5. **Clear browser cache** and try again

---

**Priority Order:**
1. ⚡ **Backend environment variables** (most critical)
2. ⚡ **Frontend API URL** (second priority)
3. ⚡ **Test the application** (verification)

**Estimated Fix Time:** 10-15 minutes after applying all changes