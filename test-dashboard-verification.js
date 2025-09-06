const fetch = require('node-fetch');

async function testDashboardVerification() {
  console.log('🔧 Testing Dashboard Verification...\n');

  try {
    // Step 1: Test server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running');
      console.log('📊 Health data:', healthData);
    } else {
      console.log('❌ Server health check failed');
      console.log('💡 Please start the backend server with: cd backend && npm start');
      return;
    }

    // Step 2: Test if dashboard routes are registered
    console.log('\n2️⃣ Testing dashboard route registration...');
    
    // Try to access a non-existent route to see if we get the 404 handler
    const testResponse = await fetch('http://localhost:5000/api/test-route');
    const testData = await testResponse.json();
    
    if (testData.error && testData.error.includes('Cannot GET')) {
      console.log('✅ 404 handler is working - routes are properly registered');
    } else {
      console.log('❌ 404 handler not working properly');
    }

    // Step 3: Test dashboard route specifically
    console.log('\n3️⃣ Testing dashboard route specifically...');
    
    const dashboardResponse = await fetch('http://localhost:5000/api/dashboard/overview');
    console.log('📊 Dashboard response status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 401) {
      console.log('✅ Dashboard route exists but requires authentication (expected)');
    } else if (dashboardResponse.status === 404) {
      console.log('❌ Dashboard route not found - routes not properly registered');
      console.log('💡 Please restart the backend server');
    } else {
      console.log('📊 Unexpected response:', dashboardResponse.status);
    }

    // Step 4: Check backend console for dashboard route logs
    console.log('\n4️⃣ Backend Console Check:');
    console.log('📋 Please check your backend console for these logs:');
    console.log('   - "📊 Dashboard routes loaded"');
    console.log('   - "Server running on port 5000"');
    console.log('   - Any error messages about dashboard routes');

    // Step 5: Manual verification steps
    console.log('\n5️⃣ Manual Verification Steps:');
    console.log('📋 Please perform these steps:');
    console.log('   1. Stop the backend server (Ctrl+C)');
    console.log('   2. Start it again: cd backend && npm start');
    console.log('   3. Look for "📊 Dashboard routes loaded" in console');
    console.log('   4. Try accessing the dashboard in the frontend');

    console.log('\n🎯 Summary:');
    console.log('   - ✅ Server is running');
    console.log('   - ❓ Dashboard routes need verification');
    console.log('   - 💡 Restart backend server if routes not working');

  } catch (error) {
    console.error('❌ Error in verification:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
  }
}

// Run the verification
testDashboardVerification(); 