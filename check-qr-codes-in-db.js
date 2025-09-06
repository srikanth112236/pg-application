const mongoose = require('mongoose');
require('dotenv').config();

async function checkQRCodes() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-app');
    
    const QRCode = require('./backend/src/models/qrCode.model');
    
    console.log('\n📋 Checking all QR codes in database...');
    
    // Get all QR codes
    const allQRCodes = await QRCode.find({}).populate('branchId').populate('pgId');
    
    console.log(`\n✅ Found ${allQRCodes.length} QR codes in database:`);
    console.log('='.repeat(60));
    
    if (allQRCodes.length === 0) {
      console.log('❌ No QR codes found in database!');
      console.log('\n🔧 Solution: Generate QR codes in admin panel');
      console.log('1. Login as admin');
      console.log('2. Go to QR Code management');
      console.log('3. Generate new QR codes for branches');
    } else {
      allQRCodes.forEach((qr, index) => {
        console.log(`\n${index + 1}. QR Code:`);
        console.log(`   Code: ${qr.code}`);
        console.log(`   Is Active: ${qr.isActive}`);
        console.log(`   Branch: ${qr.branchId?.name || 'No branch'} (${qr.branchId?._id})`);
        console.log(`   PG: ${qr.pgId?.name || 'No PG'} (${qr.pgId?._id})`);
        console.log(`   Created: ${qr.createdAt}`);
        console.log(`   URL: http://localhost:3000/public/qr/${qr.code}`);
      });
      
      // Check the specific QR code from the error
      const targetQR = '3a11c9848735fba6fb3a46d2adb22de';
      console.log(`\n🎯 Checking specific QR code: ${targetQR}`);
      console.log('-'.repeat(50));
      
      const specificQR = await QRCode.findOne({ code: targetQR }).populate('branchId').populate('pgId');
      
      if (specificQR) {
        console.log('✅ Target QR code found:');
        console.log(`   Code: ${specificQR.code}`);
        console.log(`   Is Active: ${specificQR.isActive}`);
        console.log(`   Branch: ${specificQR.branchId?.name || 'No branch'}`);
        console.log(`   PG: ${specificQR.pgId?.name || 'No PG'}`);
        
        if (!specificQR.isActive) {
          console.log('\n❌ QR code is INACTIVE!');
          console.log('🔧 Solution: Activate the QR code');
        } else {
          console.log('\n✅ QR code is active and should work');
          
          // Check if payment info exists for this branch
          const PaymentInfo = require('./backend/src/models/paymentInfo.model');
          const paymentInfo = await PaymentInfo.findOne({ 
            branchId: specificQR.branchId._id, 
            isActive: true 
          });
          
          if (paymentInfo) {
            console.log('✅ Payment info found for this branch');
            console.log(`   UPI ID: ${paymentInfo.upiId}`);
            console.log(`   Bank: ${paymentInfo.bankName}`);
          } else {
            console.log('❌ No payment info configured for this branch');
            console.log('🔧 Solution: Configure payment info in admin panel');
          }
        }
      } else {
        console.log('❌ Target QR code NOT found in database');
        console.log('🔧 Solution: Use one of the existing QR codes above or generate new one');
      }
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Use an existing active QR code from the list above');
    console.log('2. Or generate new QR codes in admin panel');
    console.log('3. Ensure QR codes are marked as active');
    console.log('4. Configure payment info for each branch');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkQRCodes(); 