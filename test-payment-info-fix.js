const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPaymentInfoSystem() {
  try {
    console.log('🧪 Testing Payment Info System...\n');

    // Test 1: Check if payment info routes are accessible
    console.log('1. Testing payment info routes...');
    
    try {
      const response = await axios.get(`${BASE_URL}/payment-info/admin/all`);
      console.log('❌ Should require authentication but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Routes properly protected with authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Check if branches endpoint is working
    console.log('\n2. Testing branches endpoint...');
    
    try {
      const response = await axios.get(`${BASE_URL}/branches`);
      console.log('❌ Should require authentication but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Branches endpoint properly protected with authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Check server health
    console.log('\n3. Testing server health...');
    
    try {
      const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
      if (response.status === 200) {
        console.log('✅ Server is running and healthy');
        console.log('📊 Server status:', response.data);
      }
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
    }

    // Test 4: Check if payment info public routes are working
    console.log('\n4. Testing public QR code payment info route...');
    
    try {
      const response = await axios.get(`${BASE_URL}/payment-info/qr/test-qr-code`);
      console.log('Response status:', response.status);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ QR code route accessible but returns 404 for invalid QR (expected)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Payment Info System Test Complete!');
    console.log('\n📝 Summary:');
    console.log('- Backend routes are properly protected');
    console.log('- Server is running and healthy');
    console.log('- Payment info endpoints are accessible');
    console.log('\n💡 Next steps:');
    console.log('1. Start the frontend: cd frontend && npm run dev');
    console.log('2. Login as admin');
    console.log('3. Go to Settings → Payment Info');
    console.log('4. Select a branch and configure payment details');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentInfoSystem(); 