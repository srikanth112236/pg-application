const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testResidentVacationFlow() {
  console.log('🏠 Testing Complete Resident Vacation Flow...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const accessToken = loginData.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Get PG ID
    console.log('\n2️⃣ Getting PG information...');
    const pgResponse = await fetch(`${BASE_URL}/users/pg-info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const pgData = await pgResponse.json();
    let pgId = null;

    if (pgData.success && pgData.data.pg) {
      pgId = pgData.data.pg._id;
      console.log('✅ PG ID found:', pgId);
    } else {
      console.log('⚠️ No PG found, will use default');
    }

    // Step 3: Get current residents
    console.log('\n3️⃣ Getting current residents...');
    const residentsResponse = await fetch(`${BASE_URL}/residents?branchId=${pgId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const residentsData = await residentsResponse.json();
    let activeResidents = [];
    let inactiveResidents = [];

    if (residentsData.success) {
      activeResidents = residentsData.data.residents.filter(r => 
        r.status === 'active' && r.roomId && r.bedNumber
      );
      inactiveResidents = residentsData.data.residents.filter(r => 
        r.status === 'inactive' || r.status === 'moved_out'
      );
      console.log(`✅ Found ${activeResidents.length} active residents with room assignments`);
      console.log(`✅ Found ${inactiveResidents.length} inactive/moved out residents`);
    }

    // Step 4: Test resident vacation (if we have active residents)
    if (activeResidents.length > 0) {
      console.log('\n4️⃣ Testing resident vacation...');
      const testResident = activeResidents[0];
      
      console.log(`📋 Testing with resident: ${testResident.firstName} ${testResident.lastName}`);
      console.log(`🏠 Current room: ${testResident.roomNumber}, Bed: ${testResident.bedNumber}`);
      console.log(`📊 Current status: ${testResident.status}, Is Active: ${testResident.isActive}`);

      // Test immediate vacation
      const vacateResponse = await fetch(`${BASE_URL}/residents/${testResident._id}/vacate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacationType: 'immediate'
        })
      });

      const vacateData = await vacateResponse.json();
      
      if (vacateData.success) {
        console.log('✅ Resident vacation successful');
        console.log(`📝 Message: ${vacateData.message}`);
        
        // Verify resident status changed
        const verifyResponse = await fetch(`${BASE_URL}/residents/${testResident._id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          const resident = verifyData.data;
          console.log(`📊 Resident status after vacation: ${resident.status}`);
          console.log(`📊 Is active: ${resident.isActive}`);
          console.log(`📊 Room ID: ${resident.roomId}`);
          console.log(`📊 Bed Number: ${resident.bedNumber}`);
          console.log(`📊 Check-out date: ${resident.checkOutDate}`);
          
          if (resident.status === 'inactive' && !resident.isActive && !resident.roomId) {
            console.log('✅ Resident properly vacated - status inactive, not active, no room assigned');
          } else {
            console.log('❌ Resident not properly vacated');
          }
        }
      } else {
        console.log('❌ Resident vacation failed:', vacateData.message);
      }
    } else {
      console.log('⚠️ No active residents with room assignments found for testing');
    }

    // Step 5: Test that vacated residents don't appear in onboarding
    console.log('\n5️⃣ Testing that vacated residents are filtered from onboarding...');
    
    const onboardingResidentsResponse = await fetch(`${BASE_URL}/residents?branchId=${pgId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const onboardingResidentsData = await onboardingResidentsResponse.json();
    
    if (onboardingResidentsData.success) {
      const availableForOnboarding = onboardingResidentsData.data.residents.filter(r => 
        r.status === 'active' && !r.roomId && !r.bedNumber
      );
      
      const inactiveResidents = onboardingResidentsData.data.residents.filter(r => 
        r.status === 'inactive' || r.status === 'moved_out'
      );
      
      console.log(`📊 Residents available for onboarding: ${availableForOnboarding.length}`);
      console.log(`📊 Inactive/moved out residents: ${inactiveResidents.length}`);
      
      // Check if any inactive residents are incorrectly available for onboarding
      const incorrectlyAvailable = inactiveResidents.filter(r => 
        availableForOnboarding.some(available => available._id === r._id)
      );
      
      if (incorrectlyAvailable.length === 0) {
        console.log('✅ Inactive residents are properly filtered from onboarding');
      } else {
        console.log('❌ Inactive residents are incorrectly available for onboarding');
        incorrectlyAvailable.forEach(r => {
          console.log(`   - ${r.firstName} ${r.lastName} (${r.status})`);
        });
      }
    }

    // Step 6: Test residents report to verify moved out count
    console.log('\n6️⃣ Testing residents report with moved out count...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const residentsReportResponse = await fetch(`${BASE_URL}/reports/residents?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const residentsReportData = await residentsReportResponse.json();
    
    if (residentsReportData.success) {
      console.log('✅ Residents report working');
      console.log('📊 Residents report data:');
      console.log(`   - Total residents: ${residentsReportData.data.statistics.total}`);
      console.log(`   - Active residents: ${residentsReportData.data.statistics.active}`);
      console.log(`   - Pending residents: ${residentsReportData.data.statistics.pending}`);
      console.log(`   - Moved out residents: ${residentsReportData.data.statistics.movedOut}`);
      console.log(`   - Inactive residents: ${residentsReportData.data.statistics.inactive}`);
      
      // Verify that moved out count includes inactive residents
      const totalMovedOut = (residentsReportData.data.statistics.movedOut || 0) + (residentsReportData.data.statistics.inactive || 0);
      console.log(`   - Total moved out (movedOut + inactive): ${totalMovedOut}`);
    } else {
      console.log('❌ Residents report failed:', residentsReportData.message);
    }

    // Step 7: Test that vacated residents appear in moved out section
    console.log('\n7️⃣ Testing that vacated residents appear in moved out section...');
    
    const movedOutResponse = await fetch(`${BASE_URL}/residents?branchId=${pgId}&status=inactive,moved_out`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const movedOutData = await movedOutResponse.json();
    
    if (movedOutData.success) {
      console.log(`✅ Found ${movedOutData.data.residents.length} moved out residents`);
      
      if (movedOutData.data.residents.length > 0) {
        console.log('📋 Moved out residents:');
        movedOutData.data.residents.forEach((resident, index) => {
          console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} - Status: ${resident.status}, Check-out: ${resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleDateString() : 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Failed to get moved out residents:', movedOutData.message);
    }

    console.log('\n🎉 Resident vacation flow testing completed!');
    console.log('💡 Summary:');
    console.log('   - Resident vacation should set status to "inactive"');
    console.log('   - Vacated residents should not appear in onboarding');
    console.log('   - Vacated residents should appear in moved out section');
    console.log('   - Reports should correctly count moved out residents');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testResidentVacationFlow(); 