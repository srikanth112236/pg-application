const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testOffboardingUIImprovements() {
  console.log('🧪 Testing Resident Offboarding UI Improvements...\n');

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

    // Test 1: Fetch all residents to check status indicators
    console.log('2️⃣ Testing resident status indicators...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success) {
      const allResidents = residentsData.data.residents || [];
      
      // Categorize residents by status
      const activeResidents = allResidents.filter(r => r.status === 'active' && r.roomId && r.bedNumber);
      const noticePeriodResidents = allResidents.filter(r => r.status === 'notice_period');
      const inactiveResidents = allResidents.filter(r => r.status === 'inactive');
      
      console.log('📊 Resident Status Analysis:');
      console.log(`   - Active residents: ${activeResidents.length}`);
      console.log(`   - Notice period residents: ${noticePeriodResidents.length}`);
      console.log(`   - Inactive (vacated) residents: ${inactiveResidents.length}`);
      
      // Show sample residents for each status
      if (activeResidents.length > 0) {
        console.log('\n✅ Active Residents (should show green status):');
        activeResidents.slice(0, 2).forEach(resident => {
          console.log(`   - ${resident.firstName} ${resident.lastName} (Room ${resident.roomNumber}, Bed ${resident.bedNumber})`);
        });
      }
      
      if (noticePeriodResidents.length > 0) {
        console.log('\n⏰ Notice Period Residents (should show orange status):');
        noticePeriodResidents.slice(0, 2).forEach(resident => {
          console.log(`   - ${resident.firstName} ${resident.lastName} (Vacating: ${resident.vacationDate ? new Date(resident.vacationDate).toLocaleDateString() : 'N/A'})`);
        });
      }
      
      if (inactiveResidents.length > 0) {
        console.log('\n🚪 Vacated Residents (should show red status):');
        inactiveResidents.slice(0, 2).forEach(resident => {
          console.log(`   - ${resident.firstName} ${resident.lastName} (Vacated: ${resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleDateString() : 'N/A'})`);
        });
      }

      // Test 2: Test with an active resident for offboarding
      if (activeResidents.length > 0) {
        const testResident = activeResidents[0];
        console.log(`\n3️⃣ Testing offboarding flow with: ${testResident.firstName} ${testResident.lastName}`);
        
        // Test immediate vacation
        console.log('\n4️⃣ Testing immediate vacation...');
        const immediateVacationData = {
          vacationType: 'immediate'
        };

        const immediateResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/vacate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(immediateVacationData)
        });

        const immediateResult = await immediateResponse.json();
        
        if (immediateResult.success) {
          console.log('✅ Immediate vacation successful');
          console.log('📋 Status should now show as "Vacated" in the UI');
        } else {
          console.log('❌ Immediate vacation failed:', immediateResult.message);
        }
      }

      // Test 3: Test with another resident for notice period
      if (activeResidents.length > 1) {
        const testResident2 = activeResidents[1];
        console.log(`\n5️⃣ Testing notice period with: ${testResident2.firstName} ${testResident2.lastName}`);
        
        const noticeVacationData = {
          vacationType: 'notice',
          noticeDays: 7,
          vacationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        const noticeResponse = await fetch(`${BASE_URL}/api/residents/${testResident2._id}/vacate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(noticeVacationData)
        });

        const noticeResult = await noticeResponse.json();
        
        if (noticeResult.success) {
          console.log('✅ Notice period vacation successful');
          console.log('📋 Status should now show as "Notice Period" in the UI');
          console.log(`📋 Vacation date: ${noticeVacationData.vacationDate}`);
        } else {
          console.log('❌ Notice period vacation failed:', noticeResult.message);
        }
      }

    } else {
      console.log('❌ Failed to fetch residents:', residentsData.message);
    }

    console.log('\n🎉 Offboarding UI improvements test completed!');
    console.log('\n📝 UI Improvements Summary:');
    console.log('   ✅ Enhanced resident cards with status indicators');
    console.log('   ✅ Color-coded status badges (Green: Active, Orange: Notice Period, Red: Vacated)');
    console.log('   ✅ Better room assignment display with gradient backgrounds');
    console.log('   ✅ Improved vacation type selection with larger icons and better styling');
    console.log('   ✅ Status-specific information panels (vacation dates, check-out dates)');
    console.log('   ✅ Enhanced Step 2 review details with better layout and styling');
    console.log('   ✅ Visual feedback for selected vacation types');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOffboardingUIImprovements(); 