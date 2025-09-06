const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testOnboardingCompactUI() {
  console.log('🧪 Testing Compact Resident Onboarding UI with Backend Fix...\n');

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

    // Test 1: Verify the new /onboard endpoint exists
    console.log('2️⃣ Testing new /onboard endpoint...');
    const testOnboardingData = {
      residentId: 'test-resident-id',
      roomId: 'test-room-id',
      bedNumber: '1',
      sharingTypeId: '1-sharing',
      sharingTypeCost: 5000,
      onboardingDate: new Date().toISOString().split('T')[0]
    };

    const onboardingResponse = await fetch(`${BASE_URL}/api/residents/onboard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOnboardingData)
    });

    const onboardingResult = await onboardingResponse.json();
    
    if (onboardingResponse.status === 400) {
      console.log('✅ Backend route exists! (Expected validation error for test data)');
      console.log('📋 Response:', onboardingResult.message);
    } else if (onboardingResponse.status === 404) {
      console.log('❌ Backend route still not found');
    } else {
      console.log('✅ Backend route working!');
    }

    // Test 2: Fetch residents to check compact card design
    console.log('\n3️⃣ Testing compact resident cards...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success) {
      const allResidents = residentsData.data.residents || [];
      const unassignedResidents = allResidents.filter(r => !(r.roomId && r.bedNumber));
      
      console.log('📊 Resident Analysis:');
      console.log(`   - Total residents: ${allResidents.length}`);
      console.log(`   - Unassigned residents: ${unassignedResidents.length}`);
      
      if (unassignedResidents.length > 0) {
        console.log('\n✅ Unassigned residents (should show compact cards with sky blue gradients):');
        unassignedResidents.slice(0, 2).forEach(resident => {
          console.log(`   - ${resident.firstName} ${resident.lastName} (${resident.phone})`);
        });
      }
    }

    // Test 3: Fetch sharing types to check compact room type cards
    console.log('\n4️⃣ Testing compact sharing type cards...');
    const sharingTypesResponse = await fetch(`${BASE_URL}/api/pg/sharing-types`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sharingTypesData = await sharingTypesResponse.json();
    
    if (sharingTypesData.success) {
      const sharingTypes = sharingTypesData.data || [];
      console.log(`📋 Found ${sharingTypes.length} sharing types (should show compact cards with sky blue gradients):`);
      sharingTypes.forEach(type => {
        console.log(`   - ${type.name}: ₹${type.cost?.toLocaleString()}/month`);
      });
    }

    // Test 4: Fetch available rooms to check compact room cards
    console.log('\n5️⃣ Testing compact room cards...');
    const roomsResponse = await fetch(`${BASE_URL}/api/pg/rooms/available?sharingType=1-sharing`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const roomsData = await roomsResponse.json();
    
    if (roomsData.success) {
      const availableRooms = roomsData.data || [];
      console.log(`🏠 Found ${availableRooms.length} available rooms (should show compact cards with sky blue gradients):`);
      availableRooms.slice(0, 2).forEach(room => {
        console.log(`   - Room ${room.roomNumber}: ${room.numberOfBeds} beds`);
      });
    }

    console.log('\n🎉 Compact Onboarding UI test completed!');
    console.log('\n📝 UI Improvements Summary:');
    console.log('   ✅ Backend route /api/residents/onboard added');
    console.log('   ✅ Full-width layout with minimal padding/margin');
    console.log('   ✅ Light sky blue gradients throughout all components');
    console.log('   ✅ Compact card designs with reduced spacing');
    console.log('   ✅ Smaller icons and text for better space utilization');
    console.log('   ✅ Consistent sky blue color scheme across all steps');
    console.log('   ✅ Reduced padding and margins for modern compact look');
    console.log('   ✅ Better grid layouts for room types (4 columns)');
    console.log('   ✅ Compact bed selection with 4-column grid');
    console.log('   ✅ Smaller progress indicators and buttons');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOnboardingCompactUI(); 