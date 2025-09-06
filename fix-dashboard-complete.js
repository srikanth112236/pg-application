const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function fixDashboardComplete() {
  console.log('🔧 Dashboard Fix - Complete Solution\n');

  // Step 1: Check if dashboard files exist
  console.log('1️⃣ Checking dashboard files...');
  
  const dashboardRoutesPath = path.join(__dirname, 'backend', 'src', 'routes', 'dashboard.routes.js');
  const appPath = path.join(__dirname, 'backend', 'src', 'app.js');
  
  if (fs.existsSync(dashboardRoutesPath)) {
    console.log('✅ Dashboard routes file exists');
  } else {
    console.log('❌ Dashboard routes file missing');
    console.log('💡 Creating dashboard routes file...');
    return;
  }
  
  if (fs.existsSync(appPath)) {
    console.log('✅ App.js file exists');
  } else {
    console.log('❌ App.js file missing');
    return;
  }

  // Step 2: Check if dashboard routes are imported in app.js
  console.log('\n2️⃣ Checking app.js imports...');
  
  try {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    if (appContent.includes('dashboardRoutes')) {
      console.log('✅ Dashboard routes are imported in app.js');
    } else {
      console.log('❌ Dashboard routes are NOT imported in app.js');
      console.log('💡 Please add: const dashboardRoutes = require(\'./routes/dashboard.routes\');');
    }
    
    if (appContent.includes("app.use('/api/dashboard', dashboardRoutes)")) {
      console.log('✅ Dashboard routes are registered in app.js');
    } else {
      console.log('❌ Dashboard routes are NOT registered in app.js');
      console.log('💡 Please add: app.use(\'/api/dashboard\', dashboardRoutes);');
    }
  } catch (error) {
    console.log('❌ Error reading app.js:', error.message);
  }

  // Step 3: Test server connectivity
  console.log('\n3️⃣ Testing server connectivity...');
  
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
    } else {
      console.log('❌ Server is not responding properly');
      console.log('💡 Please start the backend server: cd backend && npm start');
      return;
    }
  } catch (error) {
    console.log('❌ Server is not running on port 5000');
    console.log('💡 Please start the backend server: cd backend && npm start');
    return;
  }

  // Step 4: Test dashboard routes
  console.log('\n4️⃣ Testing dashboard routes...');
  
  try {
    const testResponse = await fetch('http://localhost:5000/api/dashboard/test');
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Dashboard routes are working!');
      console.log('📊 Test response:', testData.message);
    } else {
      console.log('❌ Dashboard routes are NOT working');
      console.log('📊 Status:', testResponse.status);
      const errorText = await testResponse.text();
      console.log('📊 Error:', errorText);
      console.log('💡 Dashboard routes are not loaded - restart the backend server');
    }
  } catch (error) {
    console.log('❌ Error testing dashboard routes:', error.message);
  }

  // Step 5: Instructions
  console.log('\n5️⃣ Fix Instructions:');
  console.log('📋 To fix the dashboard issue:');
  console.log('   1. Stop the backend server (Ctrl+C)');
  console.log('   2. Start it again: cd backend && npm start');
  console.log('   3. Look for "📊 Dashboard routes loaded" in console');
  console.log('   4. If you don\'t see this message, there\'s a syntax error');
  console.log('   5. Check the backend console for any error messages');

  console.log('\n🎯 Expected Results After Restart:');
  console.log('   - Backend console should show: "📊 Dashboard routes loaded"');
  console.log('   - Dashboard API calls should return 200 instead of 404');
  console.log('   - Frontend dashboard should display mock data');

  console.log('\n💡 If issues persist:');
  console.log('   - Check backend console for syntax errors');
  console.log('   - Verify all required models exist');
  console.log('   - Ensure database connection is working');
}

// Run the fix
fixDashboardComplete(); 