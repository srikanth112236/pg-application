const mongoose = require('mongoose');
require('dotenv').config();

async function createTestQRCode() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-app');
    
    const QRCode = require('./backend/src/models/qrCode.model');
    const Branch = require('./backend/src/models/branch.model');
    const PG = require('./backend/src/models/pg.model');
    
    // First, find an existing branch and PG
    console.log('\n📋 Finding existing branches and PGs...');
    
    const branches = await Branch.find({ isActive: true }).populate('pgId');
    const pgs = await PG.find({ isActive: true });
    
    console.log(`Found ${branches.length} branches and ${pgs.length} PGs`);
    
    if (branches.length === 0) {
      console.log('❌ No active branches found!');
      console.log('🔧 Solution: Create branches in admin panel first');
      return;
    }
    
    // Use the first branch
    const branch = branches[0];
    const pg = branch.pgId || pgs[0];
    
    if (!pg) {
      console.log('❌ No PG found for branch!');
      return;
    }
    
    console.log(`\n✅ Using Branch: ${branch.name} (${branch._id})`);
    console.log(`✅ Using PG: ${pg.name} (${pg._id})`);
    
    // Generate a new QR code
    const crypto = require('crypto');
    const newQRCode = crypto.randomBytes(16).toString('hex');
    
    console.log(`\n🔄 Creating new QR code: ${newQRCode}`);
    
    const qrCodeData = {
      code: newQRCode,
      branchId: branch._id,
      pgId: pg._id,
      description: 'Test QR Code for Payment Testing',
      isActive: true,
      usageCount: 0
    };
    
    const createdQR = await QRCode.create(qrCodeData);
    
    console.log('\n🎉 QR Code created successfully!');
    console.log('='.repeat(50));
    console.log(`QR Code: ${createdQR.code}`);
    console.log(`Branch: ${branch.name}`);
    console.log(`PG: ${pg.name}`);
    console.log(`Is Active: ${createdQR.isActive}`);
    console.log(`URL: http://localhost:3000/public/qr/${createdQR.code}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Use this QR code URL in your browser');
    console.log('2. Configure payment info for this branch in admin panel');
    console.log('3. Test the payment interface');
    
    console.log('\n📋 Admin Panel Steps:');
    console.log('1. Login as admin');
    console.log('2. Go to Settings → Payment Info');
    console.log(`3. Select branch: ${branch.name}`);
    console.log('4. Fill in payment details (UPI ID, Bank info, etc.)');
    console.log('5. Save payment information');
    console.log('6. Test the QR code again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestQRCode(); 