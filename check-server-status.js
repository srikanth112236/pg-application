const fetch = require('node-fetch');

async function checkServerStatus() {
  console.log('🔧 Checking Server Status...\n');

  try {
    // Check if server is running
    console.log('1️⃣ Checking if server is running...');
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
    } else {
      console.log('❌ Server is not responding properly');
      console.log('💡 Please start the backend server: cd backend && npm start');
      return;
    }

    // Test dashboard test route (no auth required)
    console.log('\n2️⃣ Testing dashboard test route...');
    const testResponse = await fetch('http://localhost:5000/api/dashboard/test');
    
    if (testResponse.ok) {
      console.log('✅ Dashboard routes are loaded and working!');
      const testData = await testResponse.json();
      console.log('📊 Test response:', testData.message);
    } else {
      console.log('❌ Dashboard routes are NOT loaded');
      console.log('📊 Status:', testResponse.status);
      console.log('💡 Please restart the backend server to load dashboard routes');
      return;
    }

    // Test dashboard overview route (requires auth)
    console.log('\n3️⃣ Testing dashboard overview route...');
    const overviewResponse = await fetch('http://localhost:5000/api/dashboard/overview');
    
    if (overviewResponse.status === 401) {
      console.log('✅ Dashboard overview route exists and requires authentication (expected)');
    } else if (overviewResponse.status === 404) {
      console.log('❌ Dashboard overview route not found');
      console.log('💡 Dashboard routes are not properly loaded');
    } else {
      console.log('📊 Unexpected response:', overviewResponse.status);
    }

    console.log('\n🎉 Server Status Check Completed!');
    console.log('💡 If dashboard test route works, the frontend should now work');
    console.log('🚀 Try accessing the dashboard in your frontend now');

  } catch (error) {
    console.error('❌ Error checking server:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
    console.log('💡 Start it with: cd backend && npm start');
  }
}

// Run the check
checkServerStatus(); 