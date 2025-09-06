const mongoose = require('mongoose');
require('dotenv').config();

async function testAdminGeneratedQR() {
  try {
    console.log('🧪 Testing Admin-Generated QR Codes\n');
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-app');
    
    const QRCode = require('./backend/src/models/qrCode.model');
    const PaymentInfo = require('./backend/src/models/paymentInfo.model');
    const PG = require('./backend/src/models/pg.model');
    
    console.log('\n1️⃣ CHECKING QR CODES GENERATED THROUGH ADMIN PANEL');
    console.log('='.repeat(55));
    
    // Find all QR codes
    const allQRCodes = await QRCode.find({}).populate('pgId').sort({ createdAt: -1 });
    
    console.log(`Found ${allQRCodes.length} QR codes in database`);
    
    if (allQRCodes.length === 0) {
      console.log('❌ No QR codes found!');
      console.log('📝 Steps to generate QR code:');
      console.log('1. Login to admin panel');
      console.log('2. Go to QR Code Management');
      console.log('3. Click "Generate QR Code"');
      return;
    }
    
    console.log('\n📋 All QR Codes:');
    allQRCodes.forEach((qr, index) => {
      console.log(`\n${index + 1}. QR Code: ${qr.qrCode}`);
      console.log(`   PG: ${qr.pgId?.name || 'Unknown'} (${qr.pgId?._id})`);
      console.log(`   Active: ${qr.isActive}`);
      console.log(`   Public URL: ${qr.publicUrl}`);
      console.log(`   Full URL: ${qr.fullUrl}`);
      console.log(`   Created: ${qr.createdAt}`);
      console.log(`   Usage Count: ${qr.usageCount}`);
    });
    
    // Test the most recent QR code
    const latestQR = allQRCodes[0];
    console.log(`\n2️⃣ TESTING LATEST QR CODE: ${latestQR.qrCode}`);
    console.log('='.repeat(55));
    
    if (!latestQR.isActive) {
      console.log('❌ Latest QR code is inactive!');
      return;
    }
    
    if (!latestQR.pgId) {
      console.log('❌ Latest QR code has no PG associated!');
      return;
    }
    
    console.log('✅ QR code is active and has PG associated');
    
    console.log('\n3️⃣ CHECKING PAYMENT INFO FOR THIS PG');
    console.log('='.repeat(55));
    
    // Check if payment info exists for this PG
    const paymentInfos = await PaymentInfo.find({ 
      pgId: latestQR.pgId._id, 
      isActive: true 
    }).populate('branchId', 'name');
    
    console.log(`Found ${paymentInfos.length} active payment info records for this PG`);
    
    if (paymentInfos.length === 0) {
      console.log('❌ No payment info configured for this PG');
      console.log('\n📝 Steps to configure payment info:');
      console.log('1. Login to admin panel');
      console.log('2. Go to Settings → Payment Info');
      console.log('3. Select a branch');
      console.log('4. Fill in payment details (UPI, Bank, etc.)');
      console.log('5. Save payment information');
    } else {
      console.log('\n💰 Payment Info Details:');
      paymentInfos.forEach((info, index) => {
        console.log(`\n${index + 1}. Payment Info:`);
        console.log(`   Branch: ${info.branchId?.name || 'Unknown'}`);
        console.log(`   UPI ID: ${info.upiId}`);
        console.log(`   UPI Name: ${info.upiName}`);
        console.log(`   Bank: ${info.bankName}`);
        console.log(`   Account: ${info.accountNumber}`);
        console.log(`   IFSC: ${info.ifscCode}`);
        if (info.gpayNumber) console.log(`   GPay: ${info.gpayNumber}`);
        if (info.paytmNumber) console.log(`   Paytm: ${info.paytmNumber}`);
        if (info.phonepeNumber) console.log(`   PhonePe: ${info.phonepeNumber}`);
      });
    }
    
    console.log('\n4️⃣ TESTING PAYMENT INFO SERVICE');
    console.log('='.repeat(55));
    
    const paymentInfoService = require('./backend/src/services/paymentInfo.service');
    
    try {
      const result = await paymentInfoService.getPaymentInfoByQRCode(latestQR.qrCode);
      
      console.log('🎉 SUCCESS! Payment info service working:');
      console.log('✅ QR Code found in service');
      console.log('✅ Service returned data');
      
      if (result.paymentInfo) {
        console.log('✅ Payment info found');
        console.log(`   UPI ID: ${result.paymentInfo.upiId}`);
        console.log(`   Bank: ${result.paymentInfo.bankName}`);
      } else {
        console.log('⚠️ No payment info in result (will show "not configured")');
      }
      
    } catch (serviceError) {
      console.log('❌ Service test failed:', serviceError.message);
      
      if (serviceError.message.includes('QR code not found in database')) {
        console.log('🔧 Issue: Service is looking for wrong field');
        console.log('   QR model uses "qrCode" field, not "code" field');
      }
    }
    
    console.log('\n5️⃣ FINAL TEST URL');
    console.log('='.repeat(55));
    
    const testURL = `http://localhost:3000/public/qr/${latestQR.qrCode}`;
    console.log(`\n🔗 Test this URL: ${testURL}`);
    
    console.log('\n📋 Expected Results:');
    console.log('✅ QR code page loads without error');
    if (paymentInfos.length > 0) {
      console.log('✅ Payment section shows payment methods');
      console.log('✅ User can select UPI, Bank, or Apps');
      console.log('✅ Payment details display correctly');
    } else {
      console.log('⚠️ Payment section shows "not configured" message');
      console.log('📝 Configure payment info in admin panel to see payment options');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Starting admin-generated QR test...\n');
testAdminGeneratedQR(); 