const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store tokens for testing
let accessToken = null;
let refreshToken = null;

async function testAuthFlow() {
  console.log('🧪 Starting Authentication Flow Test (localStorage)\n');

  try {
    // Step 1: Test Login
    console.log('1️⃣ Testing Login...');
    const loginData = {
      email: 'admin@pg.com',
      password: 'Admin123!'
    };

    const loginResponse = await api.post('/auth/login', loginData);
    console.log('✅ Login successful');
    console.log('📊 Response:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasUser: !!loginResponse.data.data?.user,
      hasTokens: !!loginResponse.data.data?.tokens
    });
    
    // Store tokens for testing
    if (loginResponse.data.data?.tokens) {
      accessToken = loginResponse.data.data.tokens.accessToken;
      refreshToken = loginResponse.data.data.tokens.refreshToken;
      console.log('🔑 Tokens stored for testing');
    }
    console.log('');

    // Step 2: Test Get Current User
    console.log('2️⃣ Testing Get Current User...');
    const meResponse = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Get current user successful');
    console.log('📊 Response:', {
      status: meResponse.status,
      success: meResponse.data.success,
      user: meResponse.data.data?.user
    });
    console.log('');

    // Step 3: Test Token Refresh
    console.log('3️⃣ Testing Token Refresh...');
    const refreshResponse = await api.post('/auth/refresh', {
      refreshToken
    });
    console.log('✅ Token refresh successful');
    console.log('📊 Response:', {
      status: refreshResponse.status,
      success: refreshResponse.data.success,
      hasNewToken: !!refreshResponse.data.data?.accessToken
    });
    
    // Update access token
    if (refreshResponse.data.data?.accessToken) {
      accessToken = refreshResponse.data.data.accessToken;
      console.log('🔄 Access token updated');
    }
    console.log('');

    // Step 4: Test Logout
    console.log('4️⃣ Testing Logout...');
    const logoutResponse = await api.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Logout successful');
    console.log('📊 Response:', {
      status: logoutResponse.status,
      success: logoutResponse.data.success
    });
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 401 Error Details:');
      console.log('   - Status:', error.response.status);
      console.log('   - Message:', error.response.data?.message);
      console.log('   - Error:', error.response.data?.error);
    }
  }
}

// Run the test
testAuthFlow(); 