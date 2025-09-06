const axios = require('axios');
require('dotenv').config();

async function testLoginFix() {
  try {
    console.log('🧪 Testing login fix...');

    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    console.log('✅ Login response:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      hasUser: !!loginResponse.data.data?.user,
      hasTokens: !!loginResponse.data.data?.tokens
    });

    if (loginResponse.data.success) {
      console.log('🎉 Login successful!');
      console.log('👤 User role:', loginResponse.data.data.user.role);
      console.log('🔄 Onboarding status:', loginResponse.data.data.user.onboarding ? 'Present' : 'Not applicable');
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoginFix(); 