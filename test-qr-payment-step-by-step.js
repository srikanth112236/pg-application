const axios = require('axios');

console.log('🧪 QR Payment Step-by-Step Debug\n');

const stepByStepTest = async () => {
  const qrCode = '3a11c9848735fba6fb3a46d2adb22de';
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🔍 Testing QR Code:', qrCode);
  console.log('🌐 Base URL:', baseURL);
  console.log('==========================================\n');
  
  // Step 1: Test basic QR code endpoint
  console.log('STEP 1: Testing basic QR code lookup');
  console.log('--------------------------------------');
  try {
    const qrURL = `${baseURL}/public/qr/${qrCode}`;
    console.log('📡 URL:', qrURL);
    
    const qrResponse = await axios.get(qrURL);
    console.log('✅ QR Response Status:', qrResponse.status);
    console.log('✅ QR Response Data:', JSON.stringify(qrResponse.data, null, 2));
    
    if (qrResponse.data.success) {
      const qrData = qrResponse.data.data;
      console.log('\n📋 QR Code Details:');
      console.log('- Code:', qrData.code);
      console.log('- Branch ID:', qrData.branchId);
      console.log('- PG ID:', qrData.pgId);
      console.log('- Is Active:', qrData.isActive);
      
      // Step 2: Test payment info endpoint
      console.log('\nSTEP 2: Testing payment info endpoint');
      console.log('-------------------------------------');
      try {
        const paymentURL = `${baseURL}/public/qr/${qrCode}/payment-info`;
        console.log('📡 URL:', paymentURL);
        
        const paymentResponse = await axios.get(paymentURL);
        console.log('✅ Payment Response Status:', paymentResponse.status);
        console.log('✅ Payment Response Data:', JSON.stringify(paymentResponse.data, null, 2));
        
        if (paymentResponse.data.success) {
          console.log('\n🎉 SUCCESS: Both QR and payment info working!');
          
          const data = paymentResponse.data.data;
          if (data.paymentInfo) {
            console.log('\n💰 Available Payment Methods:');
            if (data.paymentInfo.upiId) console.log('✅ UPI Payment available');
            if (data.paymentInfo.accountNumber) console.log('✅ Bank Transfer available');
            if (data.paymentInfo.gpayNumber || data.paymentInfo.paytmNumber || data.paymentInfo.phonepeNumber) {
              console.log('✅ Payment Apps available');
            }
          } else {
            console.log('⚠️ No payment info configured for this branch');
          }
        } else {
          console.log('❌ Payment info request unsuccessful');
        }
        
      } catch (paymentError) {
        console.log('\nSTEP 2 FAILED: Payment info endpoint error');
        console.error('❌ Payment Error Status:', paymentError.response?.status);
        console.error('❌ Payment Error Message:', paymentError.response?.data?.message);
        console.error('❌ Full Payment Error:', JSON.stringify(paymentError.response?.data, null, 2));
        
        if (paymentError.response?.status === 404) {
          console.log('\n🔧 SOLUTION: Payment info not found');
          console.log('1. Go to Admin Panel → Settings → Payment Info');
          console.log('2. Select the branch associated with this QR code');
          console.log('3. Configure payment details (UPI, Bank, etc.)');
          console.log('4. Save the payment information');
        }
      }
      
    } else {
      console.log('❌ QR code request unsuccessful');
    }
    
  } catch (qrError) {
    console.log('\nSTEP 1 FAILED: QR code endpoint error');
    console.error('❌ QR Error Status:', qrError.response?.status);
    console.error('❌ QR Error Message:', qrError.response?.data?.message);
    console.error('❌ Full QR Error:', JSON.stringify(qrError.response?.data, null, 2));
    
    if (qrError.response?.status === 404) {
      console.log('\n🔧 SOLUTION: QR code not found');
      console.log('1. Check if QR code exists in database');
      console.log('2. Verify QR code is active (isActive: true)');
      console.log('3. Generate new QR code if needed');
    }
  }
  
  // Step 3: Quick fixes and recommendations
  console.log('\n\nSTEP 3: Quick Fixes & Next Steps');
  console.log('================================');
  console.log('');
  console.log('If QR Code fails (404):');
  console.log('1. Generate a new QR code in Admin Panel');
  console.log('2. Check QR code table in database');
  console.log('3. Ensure QR is marked as active');
  console.log('');
  console.log('If Payment Info fails (404):');
  console.log('1. Login as admin user');
  console.log('2. Go to Settings → Payment Info');
  console.log('3. Select branch and configure payment details');
  console.log('4. Save payment information');
  console.log('');
  console.log('If both work but frontend shows error:');
  console.log('1. Check browser console for detailed logs');
  console.log('2. Verify frontend API URL configuration');
  console.log('3. Check CORS settings if running on different ports');
  
};

console.log('🚀 Starting step-by-step diagnosis...\n');
stepByStepTest();

console.log('\n🎯 This test will:');
console.log('1. Test QR code validity step by step');
console.log('2. Test payment info availability step by step');
console.log('3. Provide specific solutions for each failure point');
console.log('4. Help identify exactly where the process breaks');

console.log('\n📞 After running this test:');
console.log('1. Note which step fails (if any)');
console.log('2. Follow the specific solution for that step');
console.log('3. Re-test the frontend QR interface');
console.log('4. Check browser console for additional details'); 