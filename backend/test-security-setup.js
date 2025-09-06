const axios = require('axios');
require('dotenv').config();

async function testSecuritySetup() {
  try {
    console.log('🧪 Testing Security Setup...');

    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const { accessToken } = loginResponse.data.data.tokens;
    console.log('✅ Login successful, got access token');

    // Test security setup
    const securityResponse = await axios.post('http://localhost:5000/api/onboarding/security-setup', {
      newPassword: 'NewSecurePassword123!'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔐 Security setup response:', {
      success: securityResponse.data.success,
      message: securityResponse.data.message,
      statusCode: securityResponse.status
    });

    if (securityResponse.data.success) {
      console.log('✅ Security setup test passed!');
    } else {
      console.log('❌ Security setup failed:', securityResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSecuritySetup(); 