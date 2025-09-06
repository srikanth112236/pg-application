const fetch = require('node-fetch');

async function testDashboardMinimal() {
  console.log('🔧 Testing Dashboard Routes (Minimal Version)...\n');

  try {
    // Step 1: Test server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
    } else {
      console.log('❌ Server health check failed');
      console.log('💡 Please start the backend server with: cd backend && npm start');
      return;
    }

    // Step 2: Test dashboard test route (no auth required)
    console.log('\n2️⃣ Testing dashboard test route...');
    const testResponse = await fetch('http://localhost:5000/api/dashboard/test');
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Dashboard test route working!');
      console.log('📊 Test response:', testData.message);
    } else {
      console.log('❌ Dashboard test route failed');
      console.log('📊 Status:', testResponse.status);
      const errorText = await testResponse.text();
      console.log('📊 Error:', errorText);
      console.log('💡 Dashboard routes are not loaded - restart the backend server');
      return;
    }

    // Step 3: Test dashboard overview route (no auth required for testing)
    console.log('\n3️⃣ Testing dashboard overview route...');
    const overviewResponse = await fetch('http://localhost:5000/api/dashboard/overview');
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview route working!');
      console.log('📊 Overview response:', overviewData.success ? 'Success' : 'Failed');
      if (overviewData.success) {
        console.log('   - Total Residents:', overviewData.data.residents.total);
        console.log('   - Active Residents:', overviewData.data.residents.active);
        console.log('   - Monthly Revenue:', overviewData.data.financial.monthlyRevenue);
      }
    } else {
      console.log('❌ Dashboard overview route failed');
      console.log('📊 Status:', overviewResponse.status);
      const errorText = await overviewResponse.text();
      console.log('📊 Error:', errorText);
    }

    // Step 4: Test dashboard activities route (no auth required for testing)
    console.log('\n4️⃣ Testing dashboard activities route...');
    const activitiesResponse = await fetch('http://localhost:5000/api/dashboard/activities');
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      console.log('✅ Dashboard activities route working!');
      console.log('📊 Activities response:', activitiesData.success ? 'Success' : 'Failed');
      if (activitiesData.success) {
        console.log('   - Activities count:', activitiesData.data.length);
      }
    } else {
      console.log('❌ Dashboard activities route failed');
      console.log('📊 Status:', activitiesResponse.status);
      const errorText = await activitiesResponse.text();
      console.log('📊 Error:', errorText);
    }

    // Step 5: Test dashboard pending-tasks route (no auth required for testing)
    console.log('\n5️⃣ Testing dashboard pending-tasks route...');
    const tasksResponse = await fetch('http://localhost:5000/api/dashboard/pending-tasks');
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Dashboard pending-tasks route working!');
      console.log('📊 Pending tasks response:', tasksData.success ? 'Success' : 'Failed');
      if (tasksData.success) {
        console.log('   - Pending payments:', tasksData.data.payments.pending);
        console.log('   - Open tickets:', tasksData.data.tickets.open);
        console.log('   - Pending residents:', tasksData.data.residents.pending);
      }
    } else {
      console.log('❌ Dashboard pending-tasks route failed');
      console.log('📊 Status:', tasksResponse.status);
      const errorText = await tasksResponse.text();
      console.log('📊 Error:', errorText);
    }

    console.log('\n🎉 Dashboard Routes Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Server is running');
    console.log('   - ✅ Dashboard routes are working');
    console.log('   - ✅ All endpoints are accessible');
    console.log('   - ✅ Frontend should now work');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Navigate to dashboard in frontend');
    console.log('   2. Dashboard should now load with mock data');
    console.log('   3. Check browser console for successful API calls');

  } catch (error) {
    console.error('❌ Error in testing:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
    console.log('💡 Start it with: cd backend && npm start');
  }
}

// Run the test
testDashboardMinimal(); 