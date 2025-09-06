const mongoose = require('mongoose');
require('dotenv').config();

async function fixQRPaymentComplete() {
  try {
    console.log('🔧 Complete QR Payment Fix\n');
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-app');
    
    const QRCode = require('./backend/src/models/qrCode.model');
    const Branch = require('./backend/src/models/branch.model');
    const PG = require('./backend/src/models/pg.model');
    const PaymentInfo = require('./backend/src/models/paymentInfo.model');
    
    console.log('\n1️⃣ CHECKING EXISTING QR CODES');
    console.log('='.repeat(40));
    
    const allQRCodes = await QRCode.find({}).populate('branchId').populate('pgId');
    console.log(`Found ${allQRCodes.length} QR codes in database`);
    
    let workingQRCode = null;
    
    if (allQRCodes.length > 0) {
      console.log('\n📋 Existing QR Codes:');
      for (let i = 0; i < allQRCodes.length; i++) {
        const qr = allQRCodes[i];
        console.log(`\n${i + 1}. ${qr.code}`);
        console.log(`   Active: ${qr.isActive}`);
        console.log(`   Branch: ${qr.branchId?.name || 'No branch'}`);
        console.log(`   PG: ${qr.pgId?.name || 'No PG'}`);
        
        if (qr.isActive && qr.branchId && qr.pgId) {
          workingQRCode = qr;
          console.log('   ✅ This QR is working!');
        } else {
          console.log('   ❌ This QR has issues');
        }
      }
    }
    
    console.log('\n2️⃣ CHECKING/CREATING WORKING QR CODE');
    console.log('='.repeat(40));
    
    if (!workingQRCode) {
      console.log('No working QR code found. Creating new one...');
      
      // Find branches and PGs
      const branches = await Branch.find({ isActive: true }).populate('pgId');
      const pgs = await PG.find({ isActive: true });
      
      if (branches.length === 0) {
        console.log('❌ No active branches found!');
        console.log('Please create branches in admin panel first');
        return;
      }
      
      const branch = branches[0];
      const pg = branch.pgId || pgs[0];
      
      // Create new QR code
      const crypto = require('crypto');
      const newQRCode = crypto.randomBytes(16).toString('hex');
      
      const qrCodeData = {
        code: newQRCode,
        branchId: branch._id,
        pgId: pg._id,
        description: 'Auto-generated test QR code',
        isActive: true,
        usageCount: 0
      };
      
      workingQRCode = await QRCode.create(qrCodeData);
      console.log(`✅ Created new QR code: ${workingQRCode.code}`);
    }
    
    console.log(`\n🎯 Using QR Code: ${workingQRCode.code}`);
    console.log(`   Branch: ${workingQRCode.branchId?.name || 'Unknown'}`);
    console.log(`   PG: ${workingQRCode.pgId?.name || 'Unknown'}`);
    
    console.log('\n3️⃣ CHECKING PAYMENT INFO');
    console.log('='.repeat(40));
    
    const existingPaymentInfo = await PaymentInfo.findOne({
      branchId: workingQRCode.branchId._id,
      isActive: true
    });
    
    if (existingPaymentInfo) {
      console.log('✅ Payment info already configured for this branch');
      console.log(`   UPI ID: ${existingPaymentInfo.upiId}`);
      console.log(`   Bank: ${existingPaymentInfo.bankName}`);
    } else {
      console.log('❌ No payment info configured for this branch');
      console.log('Creating sample payment info...');
      
      const samplePaymentInfo = {
        pgId: workingQRCode.pgId._id,
        branchId: workingQRCode.branchId._id,
        upiId: 'pgadmin@paytm',
        upiName: 'PG Admin',
        accountHolderName: 'PG Admin Account',
        bankName: 'Sample Bank',
        accountNumber: '1234567890',
        ifscCode: 'SAMP0001',
        gpayNumber: '+91-9876543210',
        paytmNumber: '+91-9876543210',
        phonepeNumber: '+91-9876543210',
        paymentInstructions: 'Please transfer the amount and upload payment screenshot for verification.',
        isActive: true,
        createdBy: workingQRCode.pgId._id // Using PG ID as fallback
      };
      
      const newPaymentInfo = await PaymentInfo.create(samplePaymentInfo);
      console.log('✅ Created sample payment info');
      console.log(`   UPI ID: ${newPaymentInfo.upiId}`);
      console.log(`   Bank: ${newPaymentInfo.bankName}`);
    }
    
    console.log('\n4️⃣ TESTING THE COMPLETE FLOW');
    console.log('='.repeat(40));
    
    // Test the service
    const paymentInfoService = require('./backend/src/services/paymentInfo.service');
    
    try {
      const result = await paymentInfoService.getPaymentInfoByQRCode(workingQRCode.code);
      
      if (result.qrData && result.paymentInfo) {
        console.log('🎉 SUCCESS! Complete flow working:');
        console.log('✅ QR Code found');
        console.log('✅ Payment info found');
        console.log('✅ All data properly linked');
      } else if (result.qrData && !result.paymentInfo) {
        console.log('⚠️ PARTIAL SUCCESS:');
        console.log('✅ QR Code found');
        console.log('❌ Payment info missing (will show "not configured" message)');
      }
    } catch (serviceError) {
      console.log('❌ Service test failed:', serviceError.message);
    }
    
    console.log('\n5️⃣ FINAL RESULTS');
    console.log('='.repeat(40));
    
    console.log(`\n🔗 Working QR URL: http://localhost:3000/public/qr/${workingQRCode.code}`);
    console.log(`📱 Test this URL in your browser`);
    
    console.log('\n📋 What should work now:');
    console.log('✅ QR code loads without "Invalid QR code" error');
    console.log('✅ Payment section shows payment methods or "not configured" message');
    console.log('✅ If payment info exists, shows UPI/Bank/Apps options');
    console.log('✅ Users can select payment method and view details');
    
    console.log('\n🔧 If you want to customize payment info:');
    console.log('1. Login to admin panel');
    console.log('2. Go to Settings → Payment Info');
    console.log(`3. Select branch: ${workingQRCode.branchId?.name}`);
    console.log('4. Update payment details as needed');
    console.log('5. Save and test again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Starting complete QR payment fix...\n');
fixQRPaymentComplete(); 