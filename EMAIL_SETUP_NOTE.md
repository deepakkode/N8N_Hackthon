# 📧 Email Configuration Note

## For Your Friend's Setup

The `.env` file in the repository contains placeholder email credentials for security reasons. To get the email functionality working, your friend needs to:

### Option 1: Use Your Email Credentials (Recommended for Testing)
Replace the placeholder values in `backend/.env` with:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-actual-app-password
BREVO_SMTP_USER=your-actual-email@gmail.com
BREVO_SMTP_KEY=your-actual-brevo-smtp-key
```

**Note:** Contact the project owner for the actual email credentials.

### Option 2: Use Their Own Email (For Production)
1. Create a Gmail App Password:
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an App Password for the application
   
2. Update `backend/.env`:
   ```env
   EMAIL_USER=their-email@gmail.com
   EMAIL_PASS=their-app-password
   ```

### Option 3: Skip Email (For Development)
The application works without email configuration. Users can use the bypass OTP: `123456` for email verification.

## 🔒 Security Note
- The actual credentials are restored in your local `.env` file
- Future commits will ignore `.env` files (protected by `.gitignore`)
- Your friend should never commit their email credentials to the repository

---
**This file can be deleted after setup is complete.**