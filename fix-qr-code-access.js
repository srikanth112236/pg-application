const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function fixQRCodeAccess() {
  console.log('🔧 Fixing QR Code Access...\n');

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
    console.log('👤 User data:', {
      id: user._id,
      email: user.email,
      role: user.role,
      pgId: user.pgId || 'UNDEFINED'
    });

    if (!user.pgId) {
      console.log('\n❌ User has no PG ID - need to fix this first');
      console.log('🔧 Run: node comprehensive-pg-fix.js');
      return;
    }

    // Step 2: Check existing QR code
    console.log('\n2️⃣ Checking existing QR code...');
    const qrResponse = await fetch(`${BASE_URL}/api/qr/pg/${user.pgId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.log('✅ Existing QR code found');
      console.log('📱 QR Code:', qrData.data.qrCode);
      console.log('🔗 Public URL:', qrData.data.fullUrl);
      
      // Test the QR code
      console.log('\n3️⃣ Testing QR code access...');
      const testResponse = await fetch(`${BASE_URL}/api/public/qr/${qrData.data.qrCode}`);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ QR code is accessible publicly');
        console.log('📊 QR Data:', {
          pgName: testData.data.pgName,
          pgAddress: testData.data.pgAddress,
          isActive: testData.data.isActive
        });
        
        console.log('\n🎉 QR Code is working!');
        console.log(`🔗 Frontend URL: http://localhost:3000/public/qr/${qrData.data.qrCode}`);
        console.log(`📱 QR Code: ${qrData.data.qrCode}`);
      } else {
        console.log('❌ QR code is not accessible publicly');
        const errorData = await testResponse.json();
        console.log('Error:', errorData.message);
      }
    } else {
      console.log('❌ No QR code found - generating new one...');
      
      // Step 3: Generate new QR code
      console.log('\n3️⃣ Generating new QR code...');
      const generateResponse = await fetch(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        console.log('✅ New QR code generated');
        console.log('📱 QR Code:', generateData.data.qrCode);
        console.log('🔗 Public URL:', generateData.data.fullUrl);
        
        // Test the new QR code
        console.log('\n4️⃣ Testing new QR code access...');
        const testResponse = await fetch(`${BASE_URL}/api/public/qr/${generateData.data.qrCode}`);
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('✅ New QR code is accessible publicly');
          console.log('📊 QR Data:', {
            pgName: testData.data.pgName,
            pgAddress: testData.data.pgAddress,
            isActive: testData.data.isActive
          });
          
          console.log('\n🎉 New QR Code is working!');
          console.log(`🔗 Frontend URL: http://localhost:3000/public/qr/${generateData.data.qrCode}`);
          console.log(`📱 QR Code: ${generateData.data.qrCode}`);
        } else {
          console.log('❌ New QR code is not accessible publicly');
          const errorData = await testResponse.json();
          console.log('Error:', errorData.message);
        }
      } else {
        console.log('❌ Failed to generate QR code');
        const errorData = await generateResponse.json();
        console.log('Error:', errorData.message);
      }
    }

    console.log('\n🎉 QR Code Access Fix Complete!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixQRCodeAccess(); 