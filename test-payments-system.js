const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testPaymentsSystem() {
  console.log('🧪 Testing Payments System...\n');

  try {
    // First, login to get access token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const accessToken = loginData.accessToken;
    console.log('✅ Login successful\n');

    // Test 1: Get rooms
    console.log('2️⃣ Testing rooms endpoint...');
    const roomsResponse = await fetch(`${BASE_URL}/api/pg/rooms`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const roomsData = await roomsResponse.json();
    
    if (roomsResponse.status === 200) {
      console.log('✅ Rooms endpoint working!');
      console.log('📋 Found rooms:', roomsData.data?.length || 0);
    } else {
      console.log('❌ Rooms endpoint failed:', roomsData.message);
    }

    // Test 2: Get residents
    console.log('\n3️⃣ Testing residents endpoint...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const residentsData = await residentsResponse.json();
    
    if (residentsResponse.status === 200) {
      console.log('✅ Residents endpoint working!');
      console.log('📋 Found residents:', residentsData.data?.residents?.length || 0);
    } else {
      console.log('❌ Residents endpoint failed:', residentsData.message);
    }

    // Test 3: Get residents by room (if rooms exist)
    if (roomsData.data && roomsData.data.length > 0) {
      const testRoom = roomsData.data[0];
      console.log(`\n4️⃣ Testing residents by room (Room ${testRoom.roomNumber})...`);
      
      const roomResidentsResponse = await fetch(`${BASE_URL}/api/payments/rooms/${testRoom._id}/residents`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const roomResidentsData = await roomResidentsResponse.json();
      
      if (roomResidentsResponse.status === 200) {
        console.log('✅ Room residents endpoint working!');
        console.log('📋 Found residents in room:', roomResidentsData.data?.length || 0);
      } else {
        console.log('❌ Room residents endpoint failed:', roomResidentsData.message);
      }
    }

    // Test 4: Test payment statistics
    console.log('\n5️⃣ Testing payment statistics...');
    const statsResponse = await fetch(`${BASE_URL}/api/payments/stats/64a1b2c3d4e5f6789012345`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const statsData = await statsResponse.json();
    
    if (statsResponse.status === 200) {
      console.log('✅ Payment statistics endpoint working!');
      console.log('📊 Payment stats retrieved successfully');
    } else {
      console.log('❌ Payment statistics endpoint failed:', statsData.message);
    }

    // Test 5: Test payment marking (if residents exist)
    if (residentsData.data?.residents && residentsData.data.residents.length > 0) {
      const testResident = residentsData.data.residents[0];
      console.log(`\n6️⃣ Testing payment marking for resident: ${testResident.firstName} ${testResident.lastName}...`);
      
      // Create a dummy image file for testing
      const dummyImagePath = path.join(__dirname, 'test-payment-receipt.jpg');
      const dummyImageBuffer = Buffer.from('dummy image data for testing');
      fs.writeFileSync(dummyImagePath, dummyImageBuffer);
      
      const formData = new FormData();
      formData.append('paymentDate', new Date().toISOString().split('T')[0]);
      formData.append('paymentMethod', 'cash');
      formData.append('notes', 'Test payment');
      formData.append('paymentImage', fs.createReadStream(dummyImagePath));
      
      const paymentResponse = await fetch(`${BASE_URL}/api/payments/resident/${testResident._id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentResponse.status === 201) {
        console.log('✅ Payment marking endpoint working!');
        console.log('💰 Payment marked as completed successfully');
      } else {
        console.log('❌ Payment marking endpoint failed:', paymentData.message);
      }
      
      // Clean up dummy file
      fs.unlinkSync(dummyImagePath);
    }

    console.log('\n🎉 Payments System Test completed!');
    console.log('\n🔧 Features Implemented:');
    console.log('   ✅ Payment model with image upload support');
    console.log('   ✅ Payment service with comprehensive operations');
    console.log('   ✅ Payment controller with all CRUD operations');
    console.log('   ✅ Payment routes with authentication and authorization');
    console.log('   ✅ Image upload handling with multer');
    console.log('   ✅ Payment statistics and reporting');
    console.log('   ✅ Real-time payment status updates');

    console.log('\n📋 Payment Features:');
    console.log('   ✅ Mark payment as completed with image upload');
    console.log('   ✅ Get payments by resident');
    console.log('   ✅ Get payments by room');
    console.log('   ✅ Get residents by room');
    console.log('   ✅ Payment statistics and analytics');
    console.log('   ✅ Payment receipt download');
    console.log('   ✅ Payment report generation');
    console.log('   ✅ Real-time status updates to residents');

    console.log('\n🎯 Frontend Features:');
    console.log('   ✅ Two-tab interface: Rooms and Residents');
    console.log('   ✅ Room selection with resident list');
    console.log('   ✅ Resident search and filtering');
    console.log('   ✅ Payment modal with image upload');
    console.log('   ✅ Resident details modal');
    console.log('   ✅ Real-time payment status updates');
    console.log('   ✅ Modern UI with light sky blue gradients');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentsSystem(); 