const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testBedNumberFix() {
  console.log('🧪 Testing Bed Number Fix...\n');

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

    // Test 1: Create room with custom bed numbers
    console.log('2️⃣ Testing room creation with custom bed numbers...');
    const roomData = {
      pgId: 'your-pg-id', // Replace with actual PG ID
      branchId: 'your-branch-id', // Replace with actual branch ID
      floorId: 'your-floor-id', // Replace with actual floor ID
      roomNumber: '101',
      numberOfBeds: 4,
      sharingType: '4-sharing',
      cost: 8000,
      description: 'Test room with custom bed numbers',
      bedNumbers: ['101-A', '101-B', '101-C', '101-D']
    };

    const createRoomResponse = await fetch(`${BASE_URL}/api/pg/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    });

    const createRoomData = await createRoomResponse.json();
    
    if (createRoomData.success) {
      console.log('✅ Room created successfully with custom bed numbers');
      console.log('📋 Room details:', {
        roomNumber: createRoomData.data.roomNumber,
        numberOfBeds: createRoomData.data.numberOfBeds,
        beds: createRoomData.data.beds?.map(bed => ({
          bedNumber: bed.bedNumber,
          isOccupied: bed.isOccupied
        }))
      });
    } else {
      console.log('❌ Room creation failed:', createRoomData.message);
      if (createRoomData.error) {
        console.log('Error details:', createRoomData.error);
      }
    }

    // Test 2: Create room with auto-generated bed numbers
    console.log('\n3️⃣ Testing room creation with auto-generated bed numbers...');
    const autoRoomData = {
      pgId: 'your-pg-id', // Replace with actual PG ID
      branchId: 'your-branch-id', // Replace with actual branch ID
      floorId: 'your-floor-id', // Replace with actual floor ID
      roomNumber: '102',
      numberOfBeds: 3,
      sharingType: '3-sharing',
      cost: 6000,
      description: 'Test room with auto-generated bed numbers'
    };

    const createAutoRoomResponse = await fetch(`${BASE_URL}/api/pg/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(autoRoomData)
    });

    const createAutoRoomData = await createAutoRoomResponse.json();
    
    if (createAutoRoomData.success) {
      console.log('✅ Room created successfully with auto-generated bed numbers');
      console.log('📋 Room details:', {
        roomNumber: createAutoRoomData.data.roomNumber,
        numberOfBeds: createAutoRoomData.data.numberOfBeds,
        beds: createAutoRoomData.data.beds?.map(bed => ({
          bedNumber: bed.bedNumber,
          isOccupied: bed.isOccupied
        }))
      });
    } else {
      console.log('❌ Auto room creation failed:', createAutoRoomData.message);
      if (createAutoRoomData.error) {
        console.log('Error details:', createAutoRoomData.error);
      }
    }

    console.log('\n🎉 Bed number fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBedNumberFix(); 