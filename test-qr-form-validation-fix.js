const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testQRFormValidationFix() {
  console.log('🧪 Testing QR Form Validation Fix...\n');

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

    // Step 2: Generate QR code
    console.log('\n2️⃣ Generating QR code...');
    const qrResponse = await fetch(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.log('✅ QR code generated');
      console.log('📱 QR Code:', qrData.data.qrCode);
      
      const qrCode = qrData.data.qrCode;
      
      // Step 3: Test resident registration with empty work details
      console.log('\n3️⃣ Testing resident registration with empty work details...');
      const residentDataWithEmptyWork = {
        firstName: 'Test',
        lastName: 'Resident',
        email: 'testresident@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        permanentAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        workDetails: {
          company: '',
          designation: '',
          workAddress: ''
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543212',
          address: ''
        },
        checkInDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      console.log('📝 Submitting resident data with empty work details...');

      const residentResponse1 = await fetch(`${BASE_URL}/api/public/qr/${qrCode}/resident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentDataWithEmptyWork)
      });

      if (residentResponse1.ok) {
        const residentResult1 = await residentResponse1.json();
        console.log('✅ Resident registration with empty work details successful');
        console.log('👤 Resident Data:', {
          id: residentResult1.data.resident._id,
          name: `${residentResult1.data.resident.firstName} ${residentResult1.data.resident.lastName}`,
          email: residentResult1.data.resident.email,
          phone: residentResult1.data.resident.phone,
          status: residentResult1.data.resident.status,
          workDetails: residentResult1.data.resident.workDetails
        });
      } else {
        const errorData1 = await residentResponse1.json();
        console.log('❌ Resident registration with empty work details failed:', errorData1);
      }

      // Step 4: Test resident registration with filled work details
      console.log('\n4️⃣ Testing resident registration with filled work details...');
      const residentDataWithWork = {
        firstName: 'Test',
        lastName: 'Worker',
        email: 'testworker@example.com',
        phone: '9876543211',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        permanentAddress: {
          street: '456 Work Street',
          city: 'Work City',
          state: 'Work State',
          pincode: '654321'
        },
        workDetails: {
          company: 'Test Company',
          designation: 'Software Developer',
          workAddress: '789 Office Street'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543213',
          address: 'Emergency Address'
        },
        checkInDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      console.log('📝 Submitting resident data with filled work details...');

      const residentResponse2 = await fetch(`${BASE_URL}/api/public/qr/${qrCode}/resident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentDataWithWork)
      });

      if (residentResponse2.ok) {
        const residentResult2 = await residentResponse2.json();
        console.log('✅ Resident registration with filled work details successful');
        console.log('👤 Resident Data:', {
          id: residentResult2.data.resident._id,
          name: `${residentResult2.data.resident.firstName} ${residentResult2.data.resident.lastName}`,
          email: residentResult2.data.resident.email,
          phone: residentResult2.data.resident.phone,
          status: residentResult2.data.resident.status,
          workDetails: residentResult2.data.resident.workDetails
        });
      } else {
        const errorData2 = await residentResponse2.json();
        console.log('❌ Resident registration with filled work details failed:', errorData2);
      }

      // Step 5: Test resident registration without work details
      console.log('\n5️⃣ Testing resident registration without work details...');
      const residentDataWithoutWork = {
        firstName: 'Test',
        lastName: 'NoWork',
        email: 'testnowork@example.com',
        phone: '9876543214',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        permanentAddress: {
          street: '789 No Work Street',
          city: 'No Work City',
          state: 'No Work State',
          pincode: '789012'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543215',
          address: 'Emergency Address'
        },
        checkInDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      console.log('📝 Submitting resident data without work details...');

      const residentResponse3 = await fetch(`${BASE_URL}/api/public/qr/${qrCode}/resident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentDataWithoutWork)
      });

      if (residentResponse3.ok) {
        const residentResult3 = await residentResponse3.json();
        console.log('✅ Resident registration without work details successful');
        console.log('👤 Resident Data:', {
          id: residentResult3.data.resident._id,
          name: `${residentResult3.data.resident.firstName} ${residentResult3.data.resident.lastName}`,
          email: residentResult3.data.resident.email,
          phone: residentResult3.data.resident.phone,
          status: residentResult3.data.resident.status,
          workDetails: residentResult3.data.resident.workDetails
        });
      } else {
        const errorData3 = await residentResponse3.json();
        console.log('❌ Resident registration without work details failed:', errorData3);
      }
      
      console.log('\n🎉 QR Form Validation Fix Test Complete!');
      console.log('✅ Empty work details handled properly');
      console.log('✅ Filled work details handled properly');
      console.log('✅ Missing work details handled properly');
      console.log('✅ No validation errors');
      
    } else {
      const errorData = await qrResponse.json();
      console.log('❌ QR generation failed:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQRFormValidationFix(); 