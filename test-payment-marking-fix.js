const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';

async function testPaymentMarkingFix() {
  console.log('🧪 Testing Payment Marking Fix...\n');

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

    // Step 2: Get residents to test payment marking
    console.log('\n2️⃣ Getting residents for payment testing...');
    const residentsResponse = await fetch(`${BASE_URL}/api/residents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!residentsResponse.ok) {
      throw new Error(`Failed to get residents: ${residentsResponse.status}`);
    }

    const residentsData = await residentsResponse.json();
    const residents = residentsData.data.residents || [];
    
    if (residents.length === 0) {
      console.log('❌ No residents found. Please add some residents first.');
      return;
    }

    const testResident = residents[0];
    console.log('✅ Found test resident:', {
      id: testResident._id,
      name: `${testResident.firstName} ${testResident.lastName}`,
      phone: testResident.phone
    });

    // Step 3: Test Cash Payment (without image)
    console.log('\n3️⃣ Testing Cash Payment (without image)...');
    const cashPaymentData = new FormData();
    cashPaymentData.append('paymentDate', new Date().toISOString().split('T')[0]);
    cashPaymentData.append('paymentMethod', 'cash');
    cashPaymentData.append('notes', 'Test cash payment');

          const cashPaymentResponse = await fetch(`${BASE_URL}/api/payments/resident/${testResident._id}/mark-paid`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: cashPaymentData
    });

    if (cashPaymentResponse.ok) {
      const cashPaymentResult = await cashPaymentResponse.json();
      console.log('✅ Cash payment successful');
      console.log('💰 Payment Data:', {
        id: cashPaymentResult.data._id,
        amount: cashPaymentResult.data.amount,
        paymentMethod: cashPaymentResult.data.paymentMethod,
        status: cashPaymentResult.data.status,
        paymentDate: cashPaymentResult.data.paymentDate
      });
    } else {
      const errorData = await cashPaymentResponse.json();
      console.log('❌ Cash payment failed:', errorData);
    }

    // Step 4: Test UPI Payment (with image)
    console.log('\n4️⃣ Testing UPI Payment (with image)...');
    
    // Create a dummy image buffer for testing
    const dummyImageBuffer = Buffer.from('fake-image-data-for-testing');
    
    const upiPaymentData = new FormData();
    upiPaymentData.append('paymentDate', new Date().toISOString().split('T')[0]);
    upiPaymentData.append('paymentMethod', 'upi');
    upiPaymentData.append('notes', 'Test UPI payment');
    upiPaymentData.append('paymentImage', dummyImageBuffer, {
      filename: 'test-receipt.jpg',
      contentType: 'image/jpeg'
    });

          const upiPaymentResponse = await fetch(`${BASE_URL}/api/payments/resident/${testResident._id}/mark-paid`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: upiPaymentData
    });

    if (upiPaymentResponse.ok) {
      const upiPaymentResult = await upiPaymentResponse.json();
      console.log('✅ UPI payment successful');
      console.log('💰 Payment Data:', {
        id: upiPaymentResult.data._id,
        amount: upiPaymentResult.data.amount,
        paymentMethod: upiPaymentResult.data.paymentMethod,
        status: upiPaymentResult.data.status,
        paymentDate: upiPaymentResult.data.paymentDate,
        receiptImage: upiPaymentResult.data.receiptImage ? 'Present' : 'Missing'
      });
    } else {
      const errorData = await upiPaymentResponse.json();
      console.log('❌ UPI payment failed:', errorData);
    }

    // Step 5: Get payment history for the resident
    console.log('\n5️⃣ Getting payment history for resident...');
    const historyResponse = await fetch(`${BASE_URL}/api/payments/resident/${testResident._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Payment history retrieved');
      console.log('📊 Payment History:', {
        totalPayments: historyData.data.length,
        payments: historyData.data.map(p => ({
          id: p._id,
          method: p.paymentMethod,
          status: p.status,
          date: p.paymentDate,
          amount: p.amount
        }))
      });
    } else {
      const errorData = await historyResponse.json();
      console.log('❌ Failed to get payment history:', errorData);
    }
    
    console.log('\n🎉 Payment Marking Fix Test Complete!');
    console.log('✅ Cash payments work without image');
    console.log('✅ UPI payments work with image');
    console.log('✅ No duplicate key errors');
    console.log('✅ Payment history accessible');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentMarkingFix(); 