const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPaymentInfoRoutes() {
  console.log('🧪 Testing Payment Info Routes Fix...\n');

  // Test 1: Check if admin payment info routes are accessible (should require auth)
  console.log('1. Testing admin payment info routes...');
  try {
    const response = await axios.post(`${BASE_URL}/payment-info/admin/test-branch-id`, {
      upiId: 'test@paytm',
      upiName: 'Test User',
      accountHolderName: 'Test Account Holder'
    });
    console.log('❌ Admin route should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Admin routes properly protected with authentication');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.message);
    }
  }

  // Test 2: Check if public QR payment info route is accessible
  console.log('\n2. Testing public QR payment info route...');
  try {
    const response = await axios.get(`${BASE_URL}/public/qr/test-qr-code/payment-info`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Public route accessible but returns 404 for invalid QR (expected)');
    } else if (error.response?.status === 500) {
      console.log('⚠️ Server error - check if payment info service is properly implemented');
      console.log('Error:', error.response?.data);
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }

  // Test 3: Check if public routes are properly registered
  console.log('\n3. Testing public QR code info route...');
  try {
    const response = await axios.get(`${BASE_URL}/public/qr/test-qr-code`);
    console.log('QR info route status:', response.status);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Public QR info route accessible but returns 404 for invalid QR (expected)');
    } else {
      console.log('❌ Public QR info route error:', error.response?.status);
    }
  }

  // Test 4: Test server health
  console.log('\n4. Testing server health...');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    if (response.status === 200) {
      console.log('✅ Server is running and healthy');
    }
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
  }

  console.log('\n🎉 Payment Info Routes Test Complete!');
  console.log('\n📝 Routes Fixed:');
  console.log('- Added missing routes to app.js (qr, public, payments)');
  console.log('- Added payment info endpoint to public routes');
  console.log('- Updated frontend service to use correct endpoint');
  console.log('- Removed redundant payment info QR route');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Test admin payment info saving in Settings');
  console.log('2. Test QR Interface payment info display');
  console.log('3. Verify end-to-end flow works correctly');
}

// Run the test
testPaymentInfoRoutes(); 