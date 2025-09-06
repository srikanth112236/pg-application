const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testOnboardingFlow() {
  console.log('🧪 Testing Updated Resident Onboarding Flow...\n');

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

    // Test 1: Fetch unassigned residents
    console.log('2️⃣ Testing unassigned residents fetch...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success) {
      const unassignedResidents = residentsData.data.residents?.filter(r => !r.roomId && !r.bedNumber) || [];
      console.log(`✅ Found ${unassignedResidents.length} unassigned residents`);
      
      if (unassignedResidents.length > 0) {
        console.log('📋 Sample unassigned resident:', {
          name: `${unassignedResidents[0].firstName} ${unassignedResidents[0].lastName}`,
          phone: unassignedResidents[0].phone,
          email: unassignedResidents[0].email
        });
      }
    } else {
      console.log('❌ Failed to fetch residents:', residentsData.message);
    }

    // Test 2: Fetch sharing types
    console.log('\n3️⃣ Testing sharing types fetch...');
    const sharingTypesResponse = await fetch(`${BASE_URL}/api/pg/sharing-types`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sharingTypesData = await sharingTypesResponse.json();
    
    if (sharingTypesData.success) {
      console.log(`✅ Found ${sharingTypesData.data.length} sharing types`);
      console.log('📋 Sharing types:', sharingTypesData.data.map(st => `${st.name} - ₹${st.cost}`));
    } else {
      console.log('❌ Failed to fetch sharing types:', sharingTypesData.message);
    }

    // Test 3: Fetch available rooms for a sharing type
    console.log('\n4️⃣ Testing available rooms fetch...');
    if (sharingTypesData.success && sharingTypesData.data.length > 0) {
      const sharingType = sharingTypesData.data[0];
      const roomsResponse = await fetch(`${BASE_URL}/api/pg/rooms/available?sharingType=${sharingType.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const roomsData = await roomsResponse.json();
      
      if (roomsData.success) {
        console.log(`✅ Found ${roomsData.data.length} available rooms for ${sharingType.name}`);
        
        if (roomsData.data.length > 0) {
          const room = roomsData.data[0];
          console.log('📋 Sample room:', {
            roomNumber: room.roomNumber,
            floor: room.floorId?.name,
            beds: room.numberOfBeds,
            cost: room.cost
          });
        }
      } else {
        console.log('❌ Failed to fetch available rooms:', roomsData.message);
      }
    }

    // Test 4: Test bed details for a room
    console.log('\n5️⃣ Testing bed details fetch...');
    const roomsResponse = await fetch(`${BASE_URL}/api/pg/rooms`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const roomsData = await roomsResponse.json();
    
    if (roomsData.success && roomsData.data.length > 0) {
      const room = roomsData.data[0];
      const bedDetailsResponse = await fetch(`${BASE_URL}/api/residents/room/${room._id}/beds`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const bedDetailsData = await bedDetailsResponse.json();
      
      if (bedDetailsData.success) {
        console.log(`✅ Found bed details for Room ${room.roomNumber}`);
        console.log('📋 Bed details:', bedDetailsData.data.beds?.map(bed => ({
          bedNumber: bed.bedNumber,
          isOccupied: bed.isOccupied,
          occupiedBy: bed.occupiedBy
        })));
      } else {
        console.log('❌ Failed to fetch bed details:', bedDetailsData.message);
      }
    }

    console.log('\n🎉 Onboarding flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOnboardingFlow(); 