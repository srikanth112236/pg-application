const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'admin@pg.com';
const TEST_PASSWORD = 'admin123';

let accessToken = '';
let testBranchId = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.data.success) {
      accessToken = response.data.data.tokens.accessToken;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return false;
  }
}

async function getBranches() {
  try {
    console.log('🏢 Fetching branches...');
    const response = await axios.get(`${BASE_URL}/api/branch/list`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data.length > 0) {
      testBranchId = response.data.data[0]._id;
      console.log('✅ Branches fetched:', response.data.data.length);
      console.log('📍 Using branch:', response.data.data[0].name, 'ID:', testBranchId);
      return true;
    } else {
      console.log('❌ No branches found');
      return false;
    }
  } catch (error) {
    console.log('❌ Branch fetch error:', error.response?.data || error.message);
    return false;
  }
}

async function testFloorsAPI() {
  try {
    console.log('\n🏗️ Testing Floors API...');
    
    // Test without branch parameter (should use default branch)
    console.log('📋 Testing floors without branchId parameter...');
    const withoutBranchResponse = await axios.get(`${BASE_URL}/api/pg/floors`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Floors without branchId:', withoutBranchResponse.data.success ? 'Success' : 'Failed');
    console.log('📊 Count:', withoutBranchResponse.data.data?.length || 0);

    // Test with branch parameter
    console.log('📋 Testing floors with branchId parameter...');
    const withBranchResponse = await axios.get(`${BASE_URL}/api/pg/floors?branchId=${testBranchId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Floors with branchId:', withBranchResponse.data.success ? 'Success' : 'Failed');
    console.log('📊 Count:', withBranchResponse.data.data?.length || 0);
    
    // Verify that floors belong to the specified branch
    if (withBranchResponse.data.data?.length > 0) {
      const floor = withBranchResponse.data.data[0];
      console.log('🔍 Sample floor branchId:', floor.branchId);
      console.log('🔍 Requested branchId:', testBranchId);
      console.log('✅ Branch match:', floor.branchId === testBranchId ? 'Yes' : 'No');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Floors API test error:', error.response?.data || error.message);
    return false;
  }
}

async function testRoomsAPI() {
  try {
    console.log('\n🏠 Testing Rooms API...');
    
    // Test without branch parameter (should use default branch)
    console.log('📋 Testing rooms without branchId parameter...');
    const withoutBranchResponse = await axios.get(`${BASE_URL}/api/pg/rooms`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rooms without branchId:', withoutBranchResponse.data.success ? 'Success' : 'Failed');
    console.log('📊 Count:', withoutBranchResponse.data.data?.length || 0);

    // Test with branch parameter
    console.log('📋 Testing rooms with branchId parameter...');
    const withBranchResponse = await axios.get(`${BASE_URL}/api/pg/rooms?branchId=${testBranchId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rooms with branchId:', withBranchResponse.data.success ? 'Success' : 'Failed');
    console.log('📊 Count:', withBranchResponse.data.data?.length || 0);
    
    // Verify that rooms belong to the specified branch
    if (withBranchResponse.data.data?.length > 0) {
      const room = withBranchResponse.data.data[0];
      console.log('🔍 Sample room branchId:', room.branchId);
      console.log('🔍 Requested branchId:', testBranchId);
      console.log('✅ Branch match:', room.branchId === testBranchId ? 'Yes' : 'No');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Rooms API test error:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidBranch() {
  try {
    console.log('\n🚫 Testing invalid branchId...');
    const invalidBranchId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
    
    const response = await axios.get(`${BASE_URL}/api/pg/floors?branchId=${invalidBranchId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('Invalid branch ID')) {
      console.log('✅ Invalid branch ID properly rejected');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Branch Filtering Tests...');
  console.log('=' .repeat(50));
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Tests failed: Could not login');
    return;
  }
  
  // Get branches
  const branchSuccess = await getBranches();
  if (!branchSuccess) {
    console.log('❌ Tests failed: Could not fetch branches');
    return;
  }
  
  // Test floors API
  await testFloorsAPI();
  
  // Test rooms API
  await testRoomsAPI();
  
  // Test invalid branch
  await testInvalidBranch();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Branch filtering tests completed!');
}

// Run tests
runTests().catch(console.error); 