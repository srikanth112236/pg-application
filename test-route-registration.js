const express = require('express');

// Test 1: Check if payment info routes can be loaded
console.log('🧪 Testing Route Registration...\n');

try {
  console.log('1. Testing payment info routes import...');
  const paymentInfoRoutes = require('./backend/src/routes/paymentInfo.routes');
  console.log('✅ Payment info routes imported successfully');

  console.log('\n2. Testing payment info controller import...');
  const paymentInfoController = require('./backend/src/controllers/paymentInfo.controller');
  console.log('✅ Payment info controller imported successfully');

  console.log('\n3. Testing app.js import...');
  const app = require('./backend/src/app');
  console.log('✅ App.js imported successfully');

  console.log('\n4. Testing auth middleware...');
  const { authenticate, authorize } = require('./backend/src/middleware/auth.middleware');
  console.log('✅ Auth middleware imported successfully');

  console.log('\n🎉 All imports successful!');
  
  console.log('\n📝 Route Structure:');
  console.log('- POST /api/payment-info/admin/:branchId');
  console.log('- GET /api/payment-info/admin/:branchId');
  console.log('- PUT /api/payment-info/admin/:branchId');
  console.log('- DELETE /api/payment-info/admin/:branchId');
  console.log('- GET /api/payment-info/admin/all');

  console.log('\n💡 Debug Steps:');
  console.log('1. Check if backend server is running: node backend/src/server.js');
  console.log('2. Check browser console for authentication token');
  console.log('3. Verify the exact URL being called in network tab');
  console.log('4. Check if user is authenticated as admin');

} catch (error) {
  console.error('❌ Error during import:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.message.includes('paymentInfo.controller')) {
    console.log('\n🔧 Payment Info Controller Issue:');
    console.log('- Check if backend/src/controllers/paymentInfo.controller.js exists');
    console.log('- Check if it exports all required functions');
  }
  
  if (error.message.includes('auth.middleware')) {
    console.log('\n🔧 Auth Middleware Issue:');
    console.log('- Check if backend/src/middleware/auth.middleware.js exists');
    console.log('- Check if it exports authenticate and authorize functions');
  }
} 