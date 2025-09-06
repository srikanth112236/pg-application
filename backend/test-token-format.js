const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pg-app', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const User = require('./src/models/user.model');

async function testTokenFormat() {
  try {
    console.log('🔍 Testing JWT Token Format...\n');

    // Find a test user
    const user = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    
    if (!user) {
      console.log('❌ No test user found. Please create a user first.');
      return;
    }

    console.log('✅ Found test user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Generate a test token
    const testToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    console.log('\n🔑 Generated test token:', testToken.substring(0, 50) + '...');

    // Verify the token
    try {
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Token verification successful:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        iat: new Date(decoded.iat * 1000),
        exp: new Date(decoded.exp * 1000)
      });
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message);
    }

    // Test with malformed token
    const malformedToken = testToken.substring(0, testToken.length - 5) + 'INVALID';
    console.log('\n🔍 Testing malformed token:', malformedToken.substring(0, 50) + '...');
    
    try {
      const decoded = jwt.verify(malformedToken, process.env.JWT_SECRET || 'your-secret-key');
      console.log('❌ Malformed token should have failed but didn\'t');
    } catch (verifyError) {
      console.log('✅ Malformed token correctly rejected:', verifyError.message);
    }

    console.log('\n✅ Token format test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTokenFormat(); 