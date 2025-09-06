const axios = require('axios');

console.log('🧪 QR Code & Payment Info Debug\n');

const testQRCodeAndPayment = async () => {
  const qrCode = '3a11c9848735fba6fb3a46d2adb22de';
  
  console.log('🔍 Testing QR code:', qrCode);
  console.log('=====================================');
  
  // Test 1: Check if QR code exists and is valid
  try {
    console.log('\n1️⃣ Testing QR code validity...');
    const qrResponse = await axios.get(`http://localhost:5000/api/public/qr/${qrCode}`);
    
    console.log('✅ QR Code Response:');
    console.log('Status:', qrResponse.status);
    console.log('Success:', qrResponse.data.success);
    console.log('Message:', qrResponse.data.message);
    
    if (qrResponse.data.success && qrResponse.data.data) {
      const qrData = qrResponse.data.data;
      console.log('📋 QR Data:');
      console.log('- QR ID:', qrData._id);
      console.log('- Code:', qrData.code);
      console.log('- Branch ID:', qrData.branchId);
      console.log('- Branch Name:', qrData.branchName);
      console.log('- PG ID:', qrData.pgId);
      console.log('- PG Name:', qrData.pgName);
      console.log('- Is Active:', qrData.isActive);
      
      // Test 2: Now test payment info for this QR
      console.log('\n2️⃣ Testing payment info for this QR...');
      try {
        const paymentResponse = await axios.get(`http://localhost:5000/api/public/qr/${qrCode}/payment-info`);
        
        console.log('✅ Payment Info Response:');
        console.log('Status:', paymentResponse.status);
        console.log('Success:', paymentResponse.data.success);
        console.log('Message:', paymentResponse.data.message);
        
        if (paymentResponse.data.success && paymentResponse.data.data) {
          const data = paymentResponse.data.data;
          console.log('💳 Payment Data Structure:');
          console.log('- Has QR Data:', !!data.qrData);
          console.log('- Has Payment Info:', !!data.paymentInfo);
          
          if (data.paymentInfo) {
            console.log('💰 Payment Info Details:');
            console.log('- UPI ID:', data.paymentInfo.upiId);
            console.log('- UPI Name:', data.paymentInfo.upiName);
            console.log('- Account Holder:', data.paymentInfo.accountHolderName);
            console.log('- Bank Name:', data.paymentInfo.bankName);
            console.log('- Account Number:', data.paymentInfo.accountNumber);
            console.log('- IFSC Code:', data.paymentInfo.ifscCode);
            console.log('- GPay Number:', data.paymentInfo.gpayNumber);
            console.log('- Paytm Number:', data.paymentInfo.paytmNumber);
            console.log('- PhonePe Number:', data.paymentInfo.phonepeNumber);
          } else {
            console.log('⚠️ No payment info configured for this branch');
          }
        }
        
      } catch (paymentError) {
        console.error('❌ Payment Info Error:');
        console.error('Status:', paymentError.response?.status);
        console.error('Message:', paymentError.response?.data?.message);
        console.error('Full response:', JSON.stringify(paymentError.response?.data, null, 2));
      }
      
    } else {
      console.log('❌ QR code response unsuccessful');
    }
    
  } catch (qrError) {
    console.error('❌ QR Code Error:');
    console.error('Status:', qrError.response?.status);
    console.error('Message:', qrError.response?.data?.message);
    console.error('Full response:', JSON.stringify(qrError.response?.data, null, 2));
    
    if (qrError.response?.status === 404) {
      console.log('\n🔧 Possible Solutions:');
      console.log('1. QR code does not exist in database');
      console.log('2. QR code is inactive (isActive: false)');
      console.log('3. QR code format is incorrect');
      console.log('4. Database connection issue');
    }
  }
};

console.log('🚀 Starting comprehensive QR & Payment test...');
testQRCodeAndPayment();

console.log('\n📋 What This Test Checks:');
console.log('1. QR code existence and validity');
console.log('2. QR code branch and PG associations');
console.log('3. Payment info configuration for the branch');
console.log('4. Complete data structure and field availability');

console.log('\n🎯 Expected Flow:');
console.log('QR Code ➜ Branch ID ➜ Payment Info ➜ Display Options');
console.log('If any step fails, payment options won\'t show properly');

console.log('\n🔧 Quick Fixes to Try:');
console.log('1. Ensure QR code exists and isActive: true');
console.log('2. Configure payment info for the QR\'s branch in admin panel');
console.log('3. Check server logs for detailed error messages');
console.log('4. Verify backend routes are properly registered'); 