const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const QR_CODE = '2fa70976e7dc065c72d9dac79a99161e';

async function testQRCodeAccess() {
  console.log('🧪 Testing QR Code Access...\n');

  try {
    // Step 1: Test public QR access
    console.log('1️⃣ Testing public QR access...');
    const qrResponse = await fetch(`${BASE_URL}/api/public/qr/${QR_CODE}`);
    
    console.log('📊 Response status:', qrResponse.status);
    
    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.log('✅ QR code access successful');
      console.log('📱 QR Data:', {
        qrCode: qrData.data.qrCode,
        pgId: qrData.data.pgId,
        pgName: qrData.data.pgName,
        pgAddress: qrData.data.pgAddress,
        isActive: qrData.data.isActive
      });
      
      // Step 2: Test resident registration
      console.log('\n2️⃣ Testing resident registration...');
      const residentData = {
        firstName: 'Test',
        lastName: 'Resident',
        email: 'testresident@example.com',
        phone: '9876543210',
        alternatePhone: '9876543211',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        permanentAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543212'
        },
        workDetails: {
          company: 'Test Company',
          designation: 'Software Developer',
          workAddress: '456 Work Street',
          workPhone: '9876543213',
          workEmail: 'work@example.com',
          salary: '50000'
        }
      };

      const residentResponse = await fetch(`${BASE_URL}/api/public/qr/${QR_CODE}/resident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentData)
      });

      console.log('📊 Resident registration status:', residentResponse.status);
      
      if (residentResponse.ok) {
        const residentResult = await residentResponse.json();
        console.log('✅ Resident registration successful');
        console.log('👤 Resident Data:', {
          id: residentResult.data.resident._id,
          name: `${residentResult.data.resident.firstName} ${residentResult.data.resident.lastName}`,
          email: residentResult.data.resident.email,
          pgName: residentResult.data.pgName
        });
      } else {
        const errorData = await residentResponse.json();
        console.log('❌ Resident registration failed:', errorData.message);
        console.log('Error details:', errorData);
      }
    } else {
      const errorData = await qrResponse.json();
      console.log('❌ QR code access failed:', errorData.message);
      console.log('Error details:', errorData);
    }

    console.log('\n🎉 QR Code Access Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQRCodeAccess(); 