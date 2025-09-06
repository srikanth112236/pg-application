const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pg-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QRCode = require('./backend/src/models/qrCode.model');

async function checkQRCode() {
  console.log('🔍 Checking QR Code in Database...\n');

  try {
    const qrCode = '2fa70976e7dc065c72d9dac79a99161e';
    
    console.log('📱 Looking for QR code:', qrCode);
    
    const qrCodeRecord = await QRCode.findOne({ qrCode }).populate('pgId');
    
    if (qrCodeRecord) {
      console.log('✅ QR code found!');
      console.log('📊 QR Code Details:', {
        qrCode: qrCodeRecord.qrCode,
        isActive: qrCodeRecord.isActive,
        pgId: qrCodeRecord.pgId?._id,
        pgName: qrCodeRecord.pgId?.name,
        usageCount: qrCodeRecord.usageCount,
        lastUsed: qrCodeRecord.lastUsed,
        createdAt: qrCodeRecord.createdAt
      });
      
      if (!qrCodeRecord.isActive) {
        console.log('❌ QR code is inactive!');
      }
      
      if (!qrCodeRecord.pgId) {
        console.log('❌ QR code has no PG associated!');
      }
    } else {
      console.log('❌ QR code not found in database!');
      
      // List all QR codes
      const allQRCodes = await QRCode.find().populate('pgId');
      console.log('\n📋 All QR codes in database:');
      allQRCodes.forEach((qr, index) => {
        console.log(`${index + 1}. ${qr.qrCode} - ${qr.pgId?.name || 'No PG'} - ${qr.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking QR code:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkQRCode(); 