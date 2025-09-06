const fs = require('fs');
const path = require('path');

console.log('🔧 Dashboard Routes Fix Script\n');

// Step 1: Check if dashboard files exist
console.log('1️⃣ Checking dashboard files...');

const dashboardRoutesPath = path.join(__dirname, 'backend', 'src', 'routes', 'dashboard.routes.js');
const dashboardServicePath = path.join(__dirname, 'backend', 'src', 'services', 'dashboard.service.js');
const appPath = path.join(__dirname, 'backend', 'src', 'app.js');

if (fs.existsSync(dashboardRoutesPath)) {
  console.log('✅ Dashboard routes file exists');
} else {
  console.log('❌ Dashboard routes file missing');
}

if (fs.existsSync(dashboardServicePath)) {
  console.log('✅ Dashboard service file exists');
} else {
  console.log('❌ Dashboard service file missing');
}

if (fs.existsSync(appPath)) {
  console.log('✅ App.js file exists');
} else {
  console.log('❌ App.js file missing');
}

// Step 2: Check if dashboard routes are imported in app.js
console.log('\n2️⃣ Checking app.js imports...');

try {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('dashboardRoutes')) {
    console.log('✅ Dashboard routes are imported in app.js');
  } else {
    console.log('❌ Dashboard routes are NOT imported in app.js');
  }
  
  if (appContent.includes("app.use('/api/dashboard', dashboardRoutes)")) {
    console.log('✅ Dashboard routes are registered in app.js');
  } else {
    console.log('❌ Dashboard routes are NOT registered in app.js');
  }
} catch (error) {
  console.log('❌ Error reading app.js:', error.message);
}

// Step 3: Check dashboard routes file syntax
console.log('\n3️⃣ Checking dashboard routes syntax...');

try {
  const routesContent = fs.readFileSync(dashboardRoutesPath, 'utf8');
  
  if (routesContent.includes('module.exports = router')) {
    console.log('✅ Dashboard routes file has proper export');
  } else {
    console.log('❌ Dashboard routes file missing export');
  }
  
  if (routesContent.includes('console.log(\'📊 Dashboard routes loaded\')')) {
    console.log('✅ Dashboard routes file has debug log');
  } else {
    console.log('❌ Dashboard routes file missing debug log');
  }
} catch (error) {
  console.log('❌ Error reading dashboard routes:', error.message);
}

// Step 4: Check dashboard service file syntax
console.log('\n4️⃣ Checking dashboard service syntax...');

try {
  const serviceContent = fs.readFileSync(dashboardServicePath, 'utf8');
  
  if (serviceContent.includes('module.exports = new DashboardService()')) {
    console.log('✅ Dashboard service file has proper export');
  } else {
    console.log('❌ Dashboard service file missing export');
  }
  
  if (serviceContent.includes('getDashboardOverview')) {
    console.log('✅ Dashboard service has getDashboardOverview method');
  } else {
    console.log('❌ Dashboard service missing getDashboardOverview method');
  }
  
  if (serviceContent.includes('getRecentActivities')) {
    console.log('✅ Dashboard service has getRecentActivities method');
  } else {
    console.log('❌ Dashboard service missing getRecentActivities method');
  }
  
  if (serviceContent.includes('getPendingTasks')) {
    console.log('✅ Dashboard service has getPendingTasks method');
  } else {
    console.log('❌ Dashboard service missing getPendingTasks method');
  }
} catch (error) {
  console.log('❌ Error reading dashboard service:', error.message);
}

// Step 5: Instructions
console.log('\n5️⃣ Fix Instructions:');
console.log('📋 To fix the dashboard routes issue:');
console.log('   1. Stop the backend server (Ctrl+C)');
console.log('   2. Start it again: cd backend && npm start');
console.log('   3. Look for "📊 Dashboard routes loaded" in console');
console.log('   4. If you don\'t see this message, there\'s a syntax error');
console.log('   5. Check the backend console for any error messages');

console.log('\n🎯 Expected Results After Restart:');
console.log('   - Backend console should show: "📊 Dashboard routes loaded"');
console.log('   - Dashboard API calls should return 200 instead of 404');
console.log('   - Frontend dashboard should display real data');

console.log('\n💡 If issues persist:');
console.log('   - Check backend console for syntax errors');
console.log('   - Verify all required models exist');
console.log('   - Ensure database connection is working'); 