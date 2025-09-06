console.log('🧪 Payment Info Authentication Fix Debug\n');

console.log('🔍 Issue Analysis:');
console.log('Error: "Access denied. Insufficient permissions."');
console.log('This indicates the authorize middleware is rejecting the request.');
console.log('');

console.log('💡 Possible Causes:');
console.log('1. User is not actually logged in as admin');
console.log('2. JWT token is missing or invalid');
console.log('3. User role in database is not exactly "admin"');
console.log('4. Token is not being sent correctly from frontend');
console.log('5. Middleware is not finding user in request');

console.log('\n🔧 Fixes Applied:');
console.log('1. Fixed user ID access in payment info controller:');
console.log('   - Changed req.user.id to req.user._id || req.user.id');
console.log('2. Added debug logging to payment info controller');
console.log('3. Created debugging tools');

console.log('\n🎯 Immediate Debug Steps:');
console.log('');

console.log('1. Check Frontend Authentication:');
console.log('   Open browser console and run:');
console.log('   localStorage.getItem("accessToken")');
console.log('   // Should return a JWT token, not null');
console.log('');

console.log('2. Check User Role in Redux:');
console.log('   In browser console:');
console.log('   console.log(JSON.parse(localStorage.getItem("user")));');
console.log('   // Should show role: "admin"');
console.log('');

console.log('3. Check Network Request:');
console.log('   - Open DevTools → Network tab');
console.log('   - Try to save payment info');
console.log('   - Check if Authorization header is present');
console.log('   - Check the actual request URL');
console.log('');

console.log('4. Check Backend Logs:');
console.log('   - Look for authentication/authorization logs');
console.log('   - Check what user role is being detected');
console.log('   - Verify the middleware chain is working');

console.log('\n🚨 Quick Fixes to Try:');
console.log('');

console.log('A. Re-login as Admin:');
console.log('   - Log out completely');
console.log('   - Clear localStorage: localStorage.clear()');
console.log('   - Log back in as admin');
console.log('   - Try saving payment info again');
console.log('');

console.log('B. Check Admin User Exists:');
console.log('   - Run: node test-admin-auth-debug.js');
console.log('   - Verify admin user exists with correct role');
console.log('');

console.log('C. Test API Endpoint Directly:');
console.log('   - Get your JWT token from localStorage');
console.log('   - Test with curl or Postman:');
console.log('   curl -X POST http://localhost:5000/api/payment-info/admin/YOUR_BRANCH_ID \\');
console.log('     -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"upiId":"test@paytm","upiName":"Test","accountHolderName":"Test"}\'');

console.log('\n📱 Frontend Debug Commands:');
console.log('Run these in browser console:');
console.log('');
console.log('// Check if user is logged in');
console.log('console.log("User:", JSON.parse(localStorage.getItem("user") || "null"));');
console.log('');
console.log('// Check if token exists');
console.log('console.log("Token:", localStorage.getItem("accessToken"));');
console.log('');
console.log('// Check Redux state');
console.log('console.log("Redux Auth State:", window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__.store.getState().auth : "Redux DevTools not available");');

console.log('\n✨ Next Steps:');
console.log('1. Run the debug commands above');
console.log('2. Check backend server logs during the request');
console.log('3. Verify user has admin role in database');
console.log('4. Re-login if necessary');
console.log('5. Test payment info saving again'); 