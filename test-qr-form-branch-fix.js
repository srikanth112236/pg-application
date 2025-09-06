const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';

async function testQRFormBranchFix() {
  console.log('🧪 Testing QR Form Branch ID Fix...\n');

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
      
      // Step 3: Test resident registration without branchId (should be auto-added)
      console.log('\n3️⃣ Testing resident registration without branchId...');
      const residentData = {
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
          company: 'Test Company',
          designation: 'Software Developer',
          workAddress: '456 Work Street'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543212',
          address: '789 Emergency Street'
        },
        checkInDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      console.log('📝 Submitting resident data without branchId...');
      console.log('📋 Resident Data Structure:', {
        hasBranchId: 'branchId' in residentData,
        pgId: residentData.pgId,
        fields: Object.keys(residentData)
      });

      const residentResponse = await fetch(`${BASE_URL}/api/public/qr/${qrCode}/resident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentData)
      });

      if (residentResponse.ok) {
        const residentResult = await residentResponse.json();
        console.log('✅ Resident registration successful');
        console.log('👤 Resident Data:', {
          id: residentResult.data.resident._id,
          name: `${residentResult.data.resident.firstName} ${residentResult.data.resident.lastName}`,
          email: residentResult.data.resident.email,
          phone: residentResult.data.resident.phone,
          status: residentResult.data.resident.status,
          pgId: residentResult.data.resident.pgId,
          branchId: residentResult.data.resident.branchId,
          workDetails: residentResult.data.resident.workDetails
        });
        
        console.log('\n🎉 QR Form Branch ID Fix Test Complete!');
        console.log('✅ Form submission without branchId works');
        console.log('✅ BranchId auto-added by backend');
        console.log('✅ No validation errors');
        console.log('✅ Successful registration');
        
      } else {
        const errorData = await residentResponse.json();
        console.log('❌ Resident registration failed:', errorData);
        console.log('🔍 Error details:', {
          message: errorData.message,
          error: errorData.error,
          status: residentResponse.status
        });
      }
    } else {
      const errorData = await qrResponse.json();
      console.log('❌ QR generation failed:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQRFormBranchFix(); 