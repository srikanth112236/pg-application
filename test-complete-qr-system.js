const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testCompleteQRSystem() {
  console.log('🧪 Testing Complete QR System...\n');

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
      console.log('🔗 Public URL:', qrData.data.fullUrl);
      
      const qrCode = qrData.data.qrCode;
      
      // Step 3: Test public QR access
      console.log('\n3️⃣ Testing public QR access...');
      const publicResponse = await fetch(`${BASE_URL}/api/public/qr/${qrCode}`);
      
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        console.log('✅ Public QR access successful');
        console.log('📊 QR Data:', {
          pgName: publicData.data.pgName,
          pgAddress: publicData.data.pgAddress,
          isActive: publicData.data.isActive
        });
        
        // Step 4: Test resident registration through QR
        console.log('\n4️⃣ Testing resident registration through QR...');
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
            pgName: residentResult.data.pgName
          });
          
          // Step 5: Test payment with payment method
          console.log('\n5️⃣ Testing payment with payment method...');
          
          // Create a test payment with UPI method
          const paymentData = {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'upi',
            paymentImage: {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              size: 1024,
              buffer: Buffer.from('test-image-data')
            }
          };

          const paymentResponse = await fetch(`${BASE_URL}/api/payments/${residentResult.data.resident._id}/mark-paid`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            body: createFormData(paymentData)
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            console.log('✅ Payment with method successful');
            console.log('💰 Payment Data:', {
              id: paymentResult.data._id,
              amount: paymentResult.data.amount,
              paymentMethod: paymentResult.data.paymentMethod,
              status: paymentResult.data.status
            });
          } else {
            const errorData = await paymentResponse.json();
            console.log('❌ Payment failed:', errorData.message);
          }
          
        } else {
          const errorData = await residentResponse.json();
          console.log('❌ Resident registration failed:', errorData.message);
        }
        
      } else {
        const errorData = await publicResponse.json();
        console.log('❌ Public QR access failed:', errorData.message);
      }
    } else {
      const errorData = await qrResponse.json();
      console.log('❌ QR generation failed:', errorData.message);
    }

    console.log('\n🎉 Complete QR System Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function createFormData(data) {
  const FormData = require('form-data');
  const formData = new FormData();
  
  formData.append('paymentDate', data.paymentDate);
  formData.append('paymentMethod', data.paymentMethod);
  
  if (data.paymentImage) {
    formData.append('paymentImage', data.paymentImage.buffer, {
      filename: data.paymentImage.originalname,
      contentType: data.paymentImage.mimetype
    });
  }
  
  return formData;
}

testCompleteQRSystem(); 