const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testBedValidationFix() {
  console.log('🧪 Testing Bed Validation Fix...\n');

  try {
    // First, login to get access token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const accessToken = loginData.accessToken;
    console.log('✅ Login successful\n');

    // Test room creation with bed numbers
    console.log('2️⃣ Testing room creation with bed numbers...');
    const roomData = {
      floorId: 'test-floor-id', // You'll need to replace with actual floor ID
      roomNumber: '301',
      numberOfBeds: 2,
      sharingType: '2-sharing',
      cost: 6000,
      description: 'Test room with bed numbers',
      bedNumbers: ['301-A', '301-B']
    };

    const roomResponse = await fetch(`${BASE_URL}/api/pg/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    });

    const roomResult = await roomResponse.json();
    
    if (roomResult.success) {
      console.log('✅ Room creation with bed numbers successful!');
      console.log('📋 Room data:', JSON.stringify(roomResult.data, null, 2));
    } else {
      console.log('❌ Room creation failed:', roomResult.message);
      if (roomResult.error) {
        console.log('🔍 Validation error:', roomResult.error);
      }
    }

    // Test room creation without bed numbers (should work)
    console.log('\n3️⃣ Testing room creation without bed numbers...');
    const roomData2 = {
      floorId: 'test-floor-id',
      roomNumber: '302',
      numberOfBeds: 1,
      sharingType: '1-sharing',
      cost: 4000,
      description: 'Test room without bed numbers'
    };

    const roomResponse2 = await fetch(`${BASE_URL}/api/pg/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData2)
    });

    const roomResult2 = await roomResponse2.json();
    
    if (roomResult2.success) {
      console.log('✅ Room creation without bed numbers successful!');
    } else {
      console.log('❌ Room creation without bed numbers failed:', roomResult2.message);
    }

    console.log('\n🎉 Bed validation fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBedValidationFix(); 