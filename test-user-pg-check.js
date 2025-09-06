const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testUserPGCheck() {
  console.log('🧪 Testing User PG Association...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpgthree@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('✅ Login successful');
    console.log('👤 User data:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   PG ID: ${user.pgId || 'UNDEFINED'}`);
    console.log(`   PG Name: ${user.pgName || 'UNDEFINED'}`);

    if (!user.pgId) {
      console.log('\n❌ PROBLEM: User has no PG ID associated!');
      console.log('This is why QR code generation is failing.');
      console.log('\n🔧 Solutions:');
      console.log('1. Check if user was properly created with PG association');
      console.log('2. Check if PG onboarding was completed');
      console.log('3. Check user model and authentication flow');
      return;
    }

    // Step 2: Test QR code generation
    console.log('\n2️⃣ Testing QR code generation...');
    const generateResponse = await fetch(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (generateResponse.ok) {
      const qrData = await generateResponse.json();
      console.log('✅ QR code generated successfully');
      console.log(`📱 QR Code: ${qrData.data.qrCode}`);
      console.log(`🔗 Public URL: ${qrData.data.fullUrl}`);
    } else {
      const errorData = await generateResponse.json();
      console.log('❌ QR code generation failed:', errorData.message);
      console.log('Error details:', errorData);
    }

    // Step 3: Test public QR access
    if (user.pgId) {
      console.log('\n3️⃣ Testing public QR access...');
      const qrCode = 'test123'; // This would be the actual QR code
      const publicResponse = await fetch(`${BASE_URL}/api/public/qr/${qrCode}`);
      
      if (publicResponse.ok) {
        console.log('✅ Public QR access working');
      } else {
        console.log('❌ Public QR access failed (expected for test QR code)');
      }
    }

    console.log('\n🎉 User PG Check Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserPGCheck(); 