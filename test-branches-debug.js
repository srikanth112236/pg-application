const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'admin@pg.com';
const TEST_PASSWORD = 'admin123';

let accessToken = '';

async function login() {
  try {
    console.log('🔐 Attempting login...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.data.success) {
      accessToken = response.data.data.tokens.accessToken;
      console.log('✅ Login successful');
      console.log('👤 User info:', {
        id: response.data.data.user._id,
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        pgId: response.data.data.user.pgId
      });
      return response.data.data.user;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testBranchesAPI() {
  try {
    console.log('🏢 Testing branches API...');
    const response = await axios.get(`${BASE_URL}/api/branches`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Branches API successful');
      console.log('📋 Branches:', response.data.data.map(b => ({
        id: b._id,
        name: b.name,
        isDefault: b.isDefault,
        isActive: b.isActive
      })));
    } else {
      console.log('❌ Branches API failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Branches API error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

async function testUserInfo() {
  try {
    console.log('👤 Testing user info API...');
    const response = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ User info:', response.data);
  } catch (error) {
    console.log('❌ User info error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🧪 Starting branches API debug test...\n');
  
  const user = await login();
  if (!user) {
    console.log('❌ Cannot proceed without successful login');
    return;
  }

  console.log('\n');
  await testUserInfo();
  
  console.log('\n');
  await testBranchesAPI();
  
  console.log('\n🏁 Debug test completed');
}

main().catch(console.error); 