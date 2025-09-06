const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPGCreation() {
  try {
    console.log('=== Testing PG Creation Fix ===');
    
    // Test data that matches the form structure
    const testPGData = {
      name: 'Test PG Fix',
      description: 'Testing the PG creation fix',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        landmark: 'Near Test Landmark'
      },
      contact: {
        phone: '9876543210',
        email: 'testpg@example.com',
        alternatePhone: '9876543211'
      },
      property: {
        type: 'Gents PG'
      }
    };

    console.log('Test data:', JSON.stringify(testPGData, null, 2));

    // First, let's test if the server is running
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/auth/test-simple`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }

    // Test the PG creation
    try {
      const response = await axios.post(`${API_BASE_URL}/pg`, testPGData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TEST_TOKEN' // You'll need to replace this with a valid token
        }
      });
      
      console.log('✅ PG creation successful!');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ PG creation failed:');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testPGCreation(); 