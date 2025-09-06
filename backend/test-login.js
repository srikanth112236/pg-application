require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

async function testLoginFlow() {
  console.log('🧪 Testing Login Flow...\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance');
    console.log('✅ Database connected');

    // Test user data
    const testUserData = {
      email: 'admin@pg.com',
      password: 'Admin123!'
    };

    // Find user
    const user = await User.findOne({ email: testUserData.email }).select('+password');
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Test user found:', user.email);

    // Test password verification
    const isPasswordValid = await user.comparePassword(testUserData.password);
    console.log('🔐 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    console.log('🔑 Token Generation:');
    console.log('   Access Token Length:', accessToken.length);
    console.log('   Refresh Token Length:', refreshToken.length);
    console.log('   Access Token Sample:', accessToken.substring(0, 50) + '...');
    console.log('   Refresh Token Sample:', refreshToken.substring(0, 50) + '...');

    // Test token verification
    const jwt = require('jsonwebtoken');
    
    try {
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      console.log('✅ Token Verification:');
      console.log('   Access Token Payload:', decodedAccess);
      console.log('   Refresh Token Payload:', decodedRefresh);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }

    console.log('\n🎉 Login flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testLoginFlow(); 