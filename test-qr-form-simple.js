const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(jsonBody)
          });
        } catch (error) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve({ body })
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testQRFormSimple() {
  console.log('🧪 Testing QR Form Simple...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({
      email: 'testpgthree@gmail.com',
      password: 'password123'
    }));

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
    const qrResponse = await makeRequest(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.log('✅ QR code generated');
      console.log('📱 QR Code:', qrData.data.qrCode);
      
      const qrCode = qrData.data.qrCode;
      
      // Step 3: Test resident registration
      console.log('\n3️⃣ Testing resident registration...');
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

      console.log('📝 Submitting resident data...');

      const residentResponse = await makeRequest(`${BASE_URL}/api/public/qr/${qrCode}/resident`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, JSON.stringify(residentData));

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
          branchId: residentResult.data.resident.branchId
        });
        
        console.log('\n🎉 QR Form Test Complete!');
        console.log('✅ Form submission works');
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

testQRFormSimple(); 