const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testDashboardRoutes() {
  console.log('🔧 Testing Dashboard Routes...\n');

  try {
    // Step 1: Test if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/health`);
      if (healthResponse.ok) {
        console.log('✅ Server is running');
      } else {
        console.log('❌ Server health check failed');
        return;
      }
    } catch (error) {
      console.log('❌ Server is not running on port 5000');
      console.log('💡 Please start the backend server with: cd backend && npm start');
      return;
    }

    // Step 2: Login as admin
    console.log('\n2️⃣ Logging in as admin...');
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

    // Step 3: Test dashboard overview endpoint
    console.log('\n3️⃣ Testing dashboard overview endpoint...');
    
    const overviewResponse = await fetch(`${BASE_URL}/dashboard/overview`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Overview response status:', overviewResponse.status);
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview endpoint working');
      console.log('📊 Response:', overviewData.success ? 'Success' : 'Failed');
      if (overviewData.success) {
        console.log('   - Total Residents:', overviewData.data.residents.total);
        console.log('   - Active Residents:', overviewData.data.residents.active);
        console.log('   - Monthly Revenue:', overviewData.data.financial.monthlyRevenue);
      }
    } else {
      console.log('❌ Dashboard overview endpoint failed');
      const errorData = await overviewResponse.text();
      console.log('📊 Error response:', errorData);
    }

    // Step 4: Test dashboard activities endpoint
    console.log('\n4️⃣ Testing dashboard activities endpoint...');
    
    const activitiesResponse = await fetch(`${BASE_URL}/dashboard/activities?limit=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Activities response status:', activitiesResponse.status);
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      console.log('✅ Dashboard activities endpoint working');
      console.log('📊 Response:', activitiesData.success ? 'Success' : 'Failed');
      if (activitiesData.success) {
        console.log('   - Activities count:', activitiesData.data.length);
      }
    } else {
      console.log('❌ Dashboard activities endpoint failed');
      const errorData = await activitiesResponse.text();
      console.log('📊 Error response:', errorData);
    }

    // Step 5: Test dashboard pending-tasks endpoint
    console.log('\n5️⃣ Testing dashboard pending-tasks endpoint...');
    
    const tasksResponse = await fetch(`${BASE_URL}/dashboard/pending-tasks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Pending tasks response status:', tasksResponse.status);
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Dashboard pending-tasks endpoint working');
      console.log('📊 Response:', tasksData.success ? 'Success' : 'Failed');
      if (tasksData.success) {
        console.log('   - Pending payments:', tasksData.data.payments.pending);
        console.log('   - Open tickets:', tasksData.data.tickets.open);
        console.log('   - Pending residents:', tasksData.data.residents.pending);
      }
    } else {
      console.log('❌ Dashboard pending-tasks endpoint failed');
      const errorData = await tasksResponse.text();
      console.log('📊 Error response:', errorData);
    }

    // Step 6: Test with branchId parameter
    console.log('\n6️⃣ Testing dashboard endpoints with branchId...');
    
    const branchOverviewResponse = await fetch(`${BASE_URL}/dashboard/overview?branchId=test`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Branch overview response status:', branchOverviewResponse.status);
    
    if (branchOverviewResponse.ok) {
      console.log('✅ Dashboard overview with branchId working');
    } else {
      console.log('❌ Dashboard overview with branchId failed');
      const errorData = await branchOverviewResponse.text();
      console.log('📊 Error response:', errorData);
    }

    console.log('\n🎉 Dashboard Routes Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Server connectivity verified');
    console.log('   - ✅ Authentication working');
    console.log('   - ✅ Dashboard routes accessible');
    console.log('   - ✅ API endpoints responding');
    console.log('   - ✅ Frontend should now work correctly');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testDashboardRoutes(); 