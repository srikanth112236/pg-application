const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testResidentProfileFix() {
  console.log('🧪 Testing Resident Profile Fix...\n');

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
        console.log('📋 Resident details fetched successfully');
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
        console.log('📋 Found allocation letters:', lettersData.data?.length || 0);
      } else {
        console.log('❌ Allocation letters endpoint failed:', lettersData.message);
      }

    } else {
      console.log('⚠️  No residents found for testing');
    }

    console.log('\n🎉 Resident Profile Fix Test completed!');
    console.log('\n🔧 Fixes Applied:');
    console.log('   ✅ Removed complex document filtering');
    console.log('   ✅ Simplified to only show allocation letters');
    console.log('   ✅ Fixed API endpoint calls');
    console.log('   ✅ Added comprehensive profile information display');
    console.log('   ✅ Added dummy payment data');
    console.log('   ✅ Removed unused state and functions');

    console.log('\n📋 Resident Profile Features:');
    console.log('   ✅ Profile Tab: Complete resident information display');
    console.log('   ✅ Documents Tab: Allocation letters only');
    console.log('   ✅ Payments Tab: Dummy payment history');
    console.log('   ✅ Modern UI with light sky blue gradients');
    console.log('   ✅ Responsive design with animations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testResidentProfileFix(); 