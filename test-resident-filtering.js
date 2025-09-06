const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testResidentFiltering() {
  console.log('🧪 Testing Resident Filtering Logic...\n');

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

    // Test 1: Fetch all residents
    console.log('2️⃣ Testing resident fetch...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success) {
      const allResidents = residentsData.data.residents || [];
      console.log(`✅ Found ${allResidents.length} total residents`);
      
      // Analyze resident assignment status
      const assignedResidents = allResidents.filter(r => r.roomId && r.bedNumber);
      const unassignedResidents = allResidents.filter(r => !(r.roomId && r.bedNumber));
      
      console.log('📊 Resident Assignment Analysis:');
      console.log(`   - Total residents: ${allResidents.length}`);
      console.log(`   - Assigned residents: ${assignedResidents.length}`);
      console.log(`   - Unassigned residents: ${unassignedResidents.length}`);
      
      // Show sample residents
      console.log('\n📋 Sample Residents:');
      allResidents.slice(0, 5).forEach((resident, index) => {
        const isAssigned = resident.roomId && resident.bedNumber;
        console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName}`);
        console.log(`      - Phone: ${resident.phone}`);
        console.log(`      - Status: ${resident.status}`);
        console.log(`      - Room ID: ${resident.roomId || 'None'}`);
        console.log(`      - Bed Number: ${resident.bedNumber || 'None'}`);
        console.log(`      - Is Assigned: ${isAssigned ? 'Yes' : 'No'}`);
        console.log('');
      });
      
      if (unassignedResidents.length > 0) {
        console.log('✅ Found unassigned residents that should be selectable');
        console.log('📋 Unassigned residents:');
        unassignedResidents.forEach((resident, index) => {
          console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} (${resident.phone})`);
        });
      } else {
        console.log('⚠️  No unassigned residents found');
      }
      
      if (assignedResidents.length > 0) {
        console.log('\n📋 Assigned residents (should be disabled):');
        assignedResidents.forEach((resident, index) => {
          console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} - Room: ${resident.roomNumber || 'N/A'}, Bed: ${resident.bedNumber}`);
        });
      }
      
    } else {
      console.log('❌ Failed to fetch residents:', residentsData.message);
    }

    console.log('\n🎉 Resident filtering test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testResidentFiltering(); 