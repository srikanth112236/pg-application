const axios = require('axios');

console.log('🧪 QR Payment Info Debug\n');

const testQRPaymentInfo = async () => {
  try {
    // Use the QR code from the browser URL
    const qrCode = '3a11c9848735fba6fb3a46d2adb22de';
    
    console.log('🔍 Testing QR code:', qrCode);
    console.log('📡 Making request to:', `http://localhost:5000/api/public/qr/${qrCode}/payment-info`);
    
    const response = await axios.get(`http://localhost:5000/api/public/qr/${qrCode}/payment-info`);
    
    console.log('\n✅ Response received:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('Data structure:', Object.keys(response.data.data || {}));
    console.log('\nFull response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error details:');
    console.error('Status:', error.response?.status);
    console.error('StatusText:', error.response?.statusText);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error response:');
    console.error(JSON.stringify(error.response?.data, null, 2));
  }
};

console.log('🚀 Starting QR payment info test...');
testQRPaymentInfo();

console.log('\n📝 Expected Response Format:');
console.log('{');
console.log('  "success": true,');
console.log('  "message": "Payment info retrieved successfully",');
console.log('  "data": {');
console.log('    "qrData": { ... },');
console.log('    "paymentInfo": {');
console.log('      "upiId": "user@paytm",');
console.log('      "upiName": "User Name",');
console.log('      "accountHolderName": "Account Holder",');
console.log('      "bankName": "Bank Name",');
console.log('      "accountNumber": "1234567890",');
console.log('      "ifscCode": "BANK0001",');
console.log('      "gpayNumber": "+91-9876543210",');
console.log('      "paytmNumber": "+91-9876543210",');
console.log('      "phonepeNumber": "+91-9876543210",');
console.log('      "paymentInstructions": "Please transfer..."');
console.log('    }');
console.log('  }');
console.log('}');

console.log('\n🔧 Possible Issues to Check:');
console.log('1. QR code validity and database existence');
console.log('2. Payment info configured for the branch associated with QR');
console.log('3. Public route registration in app.js/server.js');
console.log('4. Backend service response format');
console.log('5. Frontend service parsing of response'); 