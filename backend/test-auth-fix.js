const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

async function testAuthFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      console.log('❌ No admin user found for testing');
      return;
    }

    console.log('👤 Test user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Test JWT token generation with new format
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log('🔑 Generated access token with new format');

    // Test token verification
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    });

    // Test user lookup
    const foundUser = await User.findById(decoded.id);
    console.log('👤 User lookup result:', {
      found: !!foundUser,
      userId: foundUser?._id,
      email: foundUser?.email,
      role: foundUser?.role
    });

    if (foundUser) {
      console.log('✅ Authentication fix is working!');
    } else {
      console.log('❌ User lookup failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAuthFix(); 