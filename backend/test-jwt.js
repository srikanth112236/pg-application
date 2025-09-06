require('dotenv').config();

console.log('🔍 Checking JWT Configuration...\n');

// Check required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN'
];

console.log('📋 Environment Variables Check:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🔧 Node Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 CORS Origin:', process.env.CORS_ORIGIN || 'http://localhost:3000');

// Test JWT token generation
const jwt = require('jsonwebtoken');

try {
  const testPayload = { id: 'test', email: 'test@example.com', role: 'superadmin' };
  const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: 'test', type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  console.log('\n✅ JWT Token Generation Test:');
  console.log('🔑 Access Token Length:', accessToken.length);
  console.log('🔄 Refresh Token Length:', refreshToken.length);
  
  // Verify tokens
  const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
  const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  console.log('✅ Token Verification Successful');
  console.log('📊 Access Token Payload:', decodedAccess);
  console.log('📊 Refresh Token Payload:', decodedRefresh);
  
} catch (error) {
  console.error('❌ JWT Test Failed:', error.message);
}

console.log('\n🎯 JWT Configuration Check Complete'); 