const axios = require('axios');
require('dotenv').config();

async function testOnboardingPG() {
  try {
    console.log('🧪 Testing Onboarding PG Configuration...');

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

    // Test PG configuration during onboarding
    console.log('\n🏠 Testing PG configuration...');
    const pgConfigData = {
      name: 'Test PG',
      description: 'A test PG for development',
      address: '123 Test Street, Test City, Test State 123456',
      phone: '9876543210',
      email: 'testpg@example.com',
      branches: [
        {
          name: 'Main Branch',
          location: 'Test City',
          floors: 2,
          roomsPerFloor: 5
        }
      ],
      sharingTypes: [
        {
          type: '1-sharing',
          name: 'Single Occupancy',
          description: 'One person per room',
          cost: 8000
        },
        {
          type: '2-sharing',
          name: 'Double Sharing',
          description: 'Two persons per room',
          cost: 6000
        },
        {
          type: '3-sharing',
          name: 'Triple Sharing',
          description: 'Three persons per room',
          cost: 5000
        },
        {
          type: '4-sharing',
          name: 'Quadruple Sharing',
          description: 'Four persons per room',
          cost: 4000
        }
      ]
    };

    try {
      const pgConfigResponse = await axios.post('http://localhost:5000/api/onboarding/configure-pg', pgConfigData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ PG Configuration:', {
        success: pgConfigResponse.data.success,
        message: pgConfigResponse.data.message,
        pgId: pgConfigResponse.data.data?.pg?._id
      });
    } catch (error) {
      console.log('❌ PG Configuration failed:', error.response?.data?.message || error.message);
    }

    // Test if user now has pgId
    console.log('\n👤 Testing user PG association...');
    try {
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ User info:', {
        success: userResponse.data.success,
        hasPgId: !!userResponse.data.data?.pgId,
        pgId: userResponse.data.data?.pgId
      });
    } catch (error) {
      console.log('❌ User info failed:', error.response?.data?.message || error.message);
    }

    // Test PG Management endpoints
    console.log('\n🏢 Testing PG Management endpoints...');
    try {
      const floorsResponse = await axios.get('http://localhost:5000/api/pg/floors', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Floors endpoint:', {
        success: floorsResponse.data.success,
        message: floorsResponse.data.message,
        count: floorsResponse.data.data?.length
      });
    } catch (error) {
      console.log('❌ Floors endpoint failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Onboarding PG test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOnboardingPG(); 