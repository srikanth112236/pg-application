const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testBackendStatus() {
  console.log('🧪 Testing Backend Status...\n');

  try {
    // Step 1: Test if backend is running
    console.log('1️⃣ Testing backend connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpgthree@gmail.com',
        password: 'password123'
      })
    });

    if (healthResponse.ok) {
      console.log('✅ Backend is running and accessible');
      
      const loginData = await healthResponse.json();
      const user = loginData.data.user;
      
      console.log('\n2️⃣ User Authentication Data:');
      console.log(`   User ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   PG ID: ${user.pgId || 'UNDEFINED'}`);
      console.log(`   PG Name: ${user.pgName || 'UNDEFINED'}`);
      
      if (!user.pgId) {
        console.log('\n❌ ISSUE FOUND: User has no PG ID!');
        console.log('This is why QR code generation fails.');
        console.log('\n🔧 Possible Solutions:');
        console.log('1. Check if user was created during PG onboarding');
        console.log('2. Check if PG onboarding was completed properly');
        console.log('3. Check user model for pgId field');
        console.log('4. Check authentication service for pgId population');
      } else {
        console.log('\n✅ User has PG ID - QR generation should work');
        
        // Test QR generation
        console.log('\n3️⃣ Testing QR code generation...');
        const qrResponse = await fetch(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${loginData.data.token}` }
        });
        
        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          console.log('✅ QR code generation successful!');
          console.log(`   QR Code: ${qrData.data.qrCode}`);
          console.log(`   Public URL: ${qrData.data.fullUrl}`);
        } else {
          const errorData = await qrResponse.json();
          console.log('❌ QR code generation failed:');
          console.log(`   Error: ${errorData.message}`);
          console.log(`   Details: ${errorData.error}`);
        }
      }
    } else {
      console.log('❌ Backend is not responding properly');
      console.log(`   Status: ${healthResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Check if all environment variables are set');
  }
}

testBackendStatus(); 