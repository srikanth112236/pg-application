const fetch = require('node-fetch');

async function testServerStatus() {
  console.log('🔧 Testing Server Status...\n');

  try {
    // Test server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running on port 5000');
      console.log('📊 Health data:', healthData);
    } else {
      console.log('❌ Server health check failed');
      console.log('💡 Please start the backend server with: cd backend && npm start');
      return;
    }

    // Test if dashboard routes are accessible
    console.log('\n2️⃣ Testing dashboard route accessibility...');
    const dashboardResponse = await fetch('http://localhost:5000/api/dashboard/overview');
    
    console.log('📊 Dashboard response status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 401) {
      console.log('✅ Dashboard route exists but requires authentication (expected)');
      console.log('🎉 Dashboard routes are properly loaded!');
    } else if (dashboardResponse.status === 404) {
      console.log('❌ Dashboard route not found');
      console.log('💡 Dashboard routes are not loaded - restart the backend server');
    } else {
      console.log('📊 Unexpected response:', dashboardResponse.status);
    }

    // Test other API routes to confirm server is working
    console.log('\n3️⃣ Testing other API routes...');
    const authResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    
    if (authResponse.status === 400 || authResponse.status === 401) {
      console.log('✅ Auth routes are working (expected error for invalid credentials)');
    } else {
      console.log('❌ Auth routes not working properly');
    }

    console.log('\n🎯 Summary:');
    console.log('   - ✅ Server is running on port 5000');
    console.log('   - ❓ Dashboard routes need verification');
    console.log('   - 💡 If dashboard returns 404, restart backend server');

  } catch (error) {
    console.error('❌ Error testing server:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
  }
}

// Run the test
testServerStatus(); 