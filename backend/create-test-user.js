const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  year: String,
  department: String,
  section: String,
  isEmailVerified: Boolean,
  college: String,
  isClubVerified: Boolean
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@klu.ac.in' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@klu.ac.in',
      password: '123456',
      userType: 'student',
      year: '2nd Year',
      department: 'Computer Science Engineering',
      section: 'A',
      isEmailVerified: true,
      college: 'KL University',
      isClubVerified: false
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@klu.ac.in');
    console.log('Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();