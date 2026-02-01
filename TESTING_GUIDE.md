# 🧪 **Vivento Testing Guide**

## 🚀 **Quick Setup for Testing**

### **1. Create Test Users**
Run one of these commands to create test accounts:

```bash
# Option 1: Use the batch file
create-test-users.bat

# Option 2: Run the script directly
cd backend
node scripts/create-test-users.js

# Option 3: Initialize database with test data
cd backend
node scripts/init-database.js --with-test-data
```

### **2. Test Accounts Created**

| Account Type | Email | Password | Features |
|-------------|-------|----------|----------|
| **Student** | `student@test.com` | `password123` | 2 event registrations, QR codes |
| **Organizer** | `organizer@test.com` | `password123` | 3 events, club management |
| **Student 2** | `student2@test.com` | `password123` | 1 registration, attended event |

---

## 👨‍🎓 **Testing Student Features**

### **Login as Student**
- Email: `student@test.com`
- Password: `password123`

### **🎯 Test Scenarios:**

#### **1. Event Discovery**
- ✅ Browse events on Discover page
- ✅ Search for events by name
- ✅ Filter by categories (technical, cultural, etc.)
- ✅ View event details and registration info

#### **2. Event Registration**
- ✅ Register for free events (AI/ML Seminar)
- ✅ Register for paid events (Web Dev Workshop)
- ✅ Upload payment screenshots
- ✅ Fill custom registration forms

#### **3. My Events Page**
- ✅ View registered events
- ✅ Check registration status (pending/approved/rejected)
- ✅ Filter events by status
- ✅ View QR codes for approved events

#### **4. QR Code Features**
- ✅ Generate QR code for approved registrations
- ✅ Copy QR data to clipboard
- ✅ Download QR code image
- ✅ View attendance status

#### **5. Profile Management**
- ✅ View personal profile
- ✅ Update profile information
- ✅ View registration statistics

---

## 👨‍💼 **Testing Organizer Features**

### **Login as Organizer**
- Email: `organizer@test.com`
- Password: `password123`

### **🎯 Test Scenarios:**

#### **1. Event Creation**
- ✅ Create new events with all details
- ✅ Set payment requirements and QR codes
- ✅ Configure registration forms
- ✅ Publish events

#### **2. Events Management**
- ✅ View all created events
- ✅ See registration counts and statistics
- ✅ Access detailed registration lists

#### **3. Registration Management**
- ✅ View all student registrations
- ✅ Approve/reject registrations
- ✅ Filter by registration status
- ✅ View student details and payment info

#### **4. QR Code Attendance**
- ✅ Scan student QR codes
- ✅ Mark attendance automatically
- ✅ Manual attendance marking
- ✅ View attendance statistics

#### **5. Data Export**
- ✅ Download CSV files
- ✅ Generate Excel reports
- ✅ Create PDF documents
- ✅ Print attendance sheets

#### **6. Club Management**
- ✅ View club details
- ✅ Manage club events
- ✅ View club statistics

---

## 🧪 **Specific Test Cases**

### **Test Case 1: Complete Registration Flow**
1. Login as student (`student@test.com`)
2. Go to Discover page
3. Find "Cultural Fest 2024" event
4. Click register and fill form
5. Upload payment screenshot
6. Check status in My Events
7. Login as organizer (`organizer@test.com`)
8. Go to Events Management
9. Find the registration and approve it
10. Login back as student
11. Check QR code is now available

### **Test Case 2: QR Attendance Flow**
1. Login as student (`student@test.com`)
2. Go to My Events
3. Find approved event (Web Development Workshop)
4. Click "Show QR Code"
5. Copy QR data
6. Login as organizer (`organizer@test.com`)
7. Go to Events Management → Web Development Workshop
8. Click "Scan QR Code"
9. Paste the QR data
10. Verify attendance is marked

### **Test Case 3: Data Export**
1. Login as organizer (`organizer@test.com`)
2. Go to Events Management
3. Select any event with registrations
4. Test all download options:
   - CSV File
   - Excel File
   - PDF Report
   - Attendance Sheet

---

## 🔍 **What to Look For**

### **✅ Expected Behaviors:**
- Smooth navigation between pages
- Real-time updates after actions
- Proper error handling
- Responsive design on different screen sizes
- Fast loading times
- Intuitive user interface

### **🚨 Things to Test:**
- Form validation (try invalid inputs)
- File upload functionality
- QR code generation and scanning
- Payment screenshot handling
- Email notifications (check console logs)
- Database updates after actions

### **📱 Mobile Testing:**
- Test on mobile browsers
- Check responsive design
- Verify touch interactions
- Test QR code display on mobile

---

## 🐛 **Common Issues & Solutions**

### **Issue: "No events found"**
**Solution:** Make sure test data was created properly. Run `create-test-users.bat` again.

### **Issue: "QR code not showing"**
**Solution:** Registration must be approved first. Login as organizer and approve the registration.

### **Issue: "Payment verification failed"**
**Solution:** This is expected - payment verification is manual. Organizer needs to approve payments.

### **Issue: "Database connection error"**
**Solution:** Ensure MySQL is running and database is initialized.

---

## 📊 **Test Data Summary**

### **Events Created:**
1. **Web Development Workshop** (Paid: ₹299, 7 days from now)
2. **AI/ML Seminar** (Free, 14 days from now)
3. **Cultural Fest 2024** (Paid: ₹150, 21 days from now)

### **Registrations Created:**
- Student 1: 2 registrations (1 approved, 1 pending)
- Student 2: 1 registration (approved + attended)

### **Test Coverage:**
- ✅ All user types (student, organizer)
- ✅ All major features
- ✅ Both free and paid events
- ✅ Different registration statuses
- ✅ Attendance tracking
- ✅ QR code functionality

---

## 🎯 **Testing Checklist**

### **Student Features:**
- [ ] Login/logout
- [ ] Event discovery and search
- [ ] Event registration
- [ ] Payment screenshot upload
- [ ] My Events page
- [ ] QR code generation
- [ ] Profile management

### **Organizer Features:**
- [ ] Login/logout
- [ ] Event creation
- [ ] Events management
- [ ] Registration approval
- [ ] QR code scanning
- [ ] Attendance marking
- [ ] Data export
- [ ] Club management

### **System Features:**
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Notifications
- [ ] Database updates
- [ ] Security (role-based access)

---

## 🚀 **Ready to Test!**

Your test environment is now ready with realistic data. You can test all features of the Vivento Events Management System using the provided test accounts.

**Happy Testing! 🎉**