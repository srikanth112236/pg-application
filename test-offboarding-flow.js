const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testOffboardingFlow() {
  console.log('🧪 Testing Resident Offboarding Flow...\n');

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

    // Test 1: Fetch allocated residents
    console.log('2️⃣ Testing allocated residents fetch...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success) {
      const allocatedResidents = residentsData.data.residents?.filter(r => r.roomId || r.bedNumber) || [];
      console.log(`✅ Found ${allocatedResidents.length} allocated residents`);
      
      if (allocatedResidents.length > 0) {
        const testResident = allocatedResidents[0];
        console.log('📋 Test resident:', {
          name: `${testResident.firstName} ${testResident.lastName}`,
          phone: testResident.phone,
          roomId: testResident.roomId,
          bedNumber: testResident.bedNumber
        });

        // Test 2: Get resident details
        console.log('\n3️⃣ Testing resident details fetch...');
        const detailsResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/details`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const detailsData = await detailsResponse.json();
        
        if (detailsData.success) {
          console.log('✅ Resident details fetched successfully');
          console.log('📋 Resident details:', {
            name: `${detailsData.data.firstName} ${detailsData.data.lastName}`,
            roomNumber: detailsData.data.roomNumber,
            bedNumber: detailsData.data.bedNumber,
            sharingType: detailsData.data.sharingType,
            monthlyRent: detailsData.data.monthlyRent
          });
        } else {
          console.log('❌ Failed to fetch resident details:', detailsData.message);
        }

        // Test 3: Test immediate vacation
        console.log('\n4️⃣ Testing immediate vacation...');
        const immediateVacationResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/vacate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vacationType: 'immediate'
          })
        });

        const immediateVacationData = await immediateVacationResponse.json();
        
        if (immediateVacationData.success) {
          console.log('✅ Immediate vacation successful');
          console.log('📋 Vacation result:', immediateVacationData.message);
        } else {
          console.log('❌ Immediate vacation failed:', immediateVacationData.message);
        }

        // Test 4: Test notice period vacation (if we have another allocated resident)
        if (allocatedResidents.length > 1) {
          const secondResident = allocatedResidents[1];
          console.log('\n5️⃣ Testing notice period vacation...');
          
          const noticeVacationResponse = await fetch(`${BASE_URL}/api/residents/${secondResident._id}/vacate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              vacationType: 'notice',
              noticeDays: 7,
              vacationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
          });

          const noticeVacationData = await noticeVacationResponse.json();
          
          if (noticeVacationData.success) {
            console.log('✅ Notice period vacation scheduled successfully');
            console.log('📋 Vacation scheduled for:', noticeVacationData.data.vacationDate);
          } else {
            console.log('❌ Notice period vacation failed:', noticeVacationData.message);
          }
        } else {
          console.log('\n5️⃣ Skipping notice period test - only one allocated resident found');
        }

      } else {
        console.log('❌ No allocated residents found for testing');
      }
    } else {
      console.log('❌ Failed to fetch residents:', residentsData.message);
    }

    console.log('\n🎉 Offboarding flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOffboardingFlow(); 