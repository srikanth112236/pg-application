const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testOffboardingVacationTypes() {
  console.log('🧪 Testing Resident Offboarding Vacation Types...\n');

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
      const allResidents = residentsData.data.residents || [];
      const allocatedResidents = allResidents.filter(r => r.roomId && r.bedNumber);
      
      console.log(`✅ Found ${allocatedResidents.length} allocated residents`);
      
      if (allocatedResidents.length === 0) {
        console.log('⚠️  No allocated residents found for testing');
        return;
      }

      // Test with first allocated resident
      const testResident = allocatedResidents[0];
      console.log(`📋 Testing with resident: ${testResident.firstName} ${testResident.lastName}`);
      console.log(`   - Room: ${testResident.roomNumber || 'N/A'}`);
      console.log(`   - Bed: ${testResident.bedNumber || 'N/A'}`);
      console.log(`   - Status: ${testResident.status}`);

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
          phone: detailsData.data.phone,
          roomNumber: detailsData.data.roomNumber,
          bedNumber: detailsData.data.bedNumber,
          sharingType: detailsData.data.sharingType,
          monthlyRent: detailsData.data.monthlyRent
        });
      } else {
        console.log('❌ Failed to fetch resident details:', detailsData.message);
        return;
      }

      // Test 3: Test immediate vacation
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
        console.log('📋 Result:', immediateResult.message);
        console.log('📋 Data:', immediateResult.data);
      } else {
        console.log('❌ Immediate vacation failed:', immediateResult.message);
        if (immediateResult.error) {
          console.log('Error details:', immediateResult.error);
        }
      }

      // Test 4: Test notice period vacation (if immediate failed)
      if (!immediateResult.success) {
        console.log('\n5️⃣ Testing notice period vacation...');
        const noticeVacationData = {
          vacationType: 'notice',
          noticeDays: 7,
          vacationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        const noticeResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/vacate`, {
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
          console.log('📋 Result:', noticeResult.message);
          console.log('📋 Data:', noticeResult.data);
        } else {
          console.log('❌ Notice period vacation failed:', noticeResult.message);
          if (noticeResult.error) {
            console.log('Error details:', noticeResult.error);
          }
        }
      }

      // Test 5: Verify vacation processor functionality
      console.log('\n6️⃣ Testing vacation processor...');
      const processorResponse = await fetch(`${BASE_URL}/api/residents/process-vacations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (processorResponse.ok) {
        const processorResult = await processorResponse.json();
        console.log('✅ Vacation processor test successful');
        console.log('📋 Result:', processorResult.message);
      } else {
        console.log('⚠️  Vacation processor endpoint not available (this is normal)');
      }

    } else {
      console.log('❌ Failed to fetch residents:', residentsData.message);
    }

    console.log('\n🎉 Offboarding vacation types test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOffboardingVacationTypes(); 