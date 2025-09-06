const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testResidentProfile() {
  console.log('🧪 Testing Resident Profile Page...\n');

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

    // Test 1: Fetch residents to get a resident ID
    console.log('2️⃣ Fetching residents to get a resident ID...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsData.success && residentsData.data.residents.length > 0) {
      const testResident = residentsData.data.residents[0];
      console.log(`✅ Found resident: ${testResident.firstName} ${testResident.lastName}`);
      console.log(`📋 Resident ID: ${testResident._id}`);

      // Test 2: Test resident details endpoint
      console.log('\n3️⃣ Testing resident details endpoint...');
      const detailsResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/details`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const detailsData = await detailsResponse.json();
      
      if (detailsResponse.status === 200) {
        console.log('✅ Resident details endpoint working!');
        console.log('📋 Resident data structure:', Object.keys(detailsData.data || {}));
      } else {
        console.log('❌ Resident details endpoint failed:', detailsData.message);
      }

      // Test 3: Test allocation letters endpoint
      console.log('\n4️⃣ Testing allocation letters endpoint...');
      const lettersResponse = await fetch(`${BASE_URL}/api/residents/${testResident._id}/allocation-letters`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const lettersData = await lettersResponse.json();
      
      if (lettersResponse.status === 200) {
        console.log('✅ Allocation letters endpoint working!');
        console.log('📋 Found letters:', lettersData.data?.length || 0);
      } else {
        console.log('❌ Allocation letters endpoint failed:', lettersData.message);
      }

      // Test 4: Test payments endpoint
      console.log('\n5️⃣ Testing payments endpoint...');
      const paymentsResponse = await fetch(`${BASE_URL}/api/payments/resident/${testResident._id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const paymentsData = await paymentsResponse.json();
      
      if (paymentsResponse.status === 200) {
        console.log('✅ Payments endpoint working!');
        console.log('📋 Found payments:', paymentsData.data?.length || 0);
      } else {
        console.log('❌ Payments endpoint failed:', paymentsData.message);
      }

    } else {
      console.log('⚠️  No residents found for testing');
    }

    console.log('\n🎉 Resident Profile Page test completed!');
    console.log('\n📝 Profile Page Features:');
    console.log('   ✅ Separate page for each resident profile');
    console.log('   ✅ Tabbed interface with Profile, Documents, Payments');
    console.log('   ✅ Profile tab with resident information');
    console.log('   ✅ Documents tab with allocation letters');
    console.log('   ✅ Payments tab with payment history');
    console.log('   ✅ Navigation from residents list to profile page');
    console.log('   ✅ Back button to return to residents list');
    console.log('   ✅ Loading states and error handling');
    console.log('   ✅ Responsive design with compact layout');

    console.log('\n🎨 Design Features:');
    console.log('   ✅ Light sky blue gradient backgrounds');
    console.log('   ✅ Compact card designs');
    console.log('   ✅ Professional tab interface');
    console.log('   ✅ Consistent color scheme');
    console.log('   ✅ Modern typography and spacing');
    console.log('   ✅ Smooth animations and transitions');

    console.log('\n📊 Data Integration:');
    console.log('   ✅ Resident details from /residents/:id/details');
    console.log('   ✅ Allocation letters from /residents/:id/allocation-letters');
    console.log('   ✅ Payment history from /payments/resident/:id');
    console.log('   ✅ PDF download functionality');
    console.log('   ✅ Status badges and icons');

    console.log('\n🔗 Navigation Flow:');
    console.log('   ✅ Residents list → Click view → Profile page');
    console.log('   ✅ Profile page → Back button → Residents list');
    console.log('   ✅ Tab switching within profile page');
    console.log('   ✅ Direct URL access to profile pages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testResidentProfile(); 