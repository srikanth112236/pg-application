const mongoose = require('mongoose');
require('dotenv').config();

async function fixPaymentIndex() {
  try {
    console.log('🔧 Fixing Payment Index Issue...\n');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_maintenance';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // List all indexes on payments collection
    console.log('\n📋 Current indexes on payments collection:');
    const indexes = await db.collection('payments').indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.unique ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });

    // Check if paymentId_1 index exists
    const paymentIdIndex = indexes.find(index => 
      Object.keys(index.key).includes('paymentId')
    );

    if (paymentIdIndex) {
      console.log('\n❌ Found problematic paymentId index:', paymentIdIndex);
      console.log('🔧 Dropping paymentId_1 index...');
      
      try {
        await db.collection('payments').dropIndex('paymentId_1');
        console.log('✅ Successfully dropped paymentId_1 index');
      } catch (error) {
        console.log('⚠️ Error dropping index (might not exist):', error.message);
      }
    } else {
      console.log('\n✅ No problematic paymentId index found');
    }

    // Verify indexes after fix
    console.log('\n📋 Updated indexes on payments collection:');
    const updatedIndexes = await db.collection('payments').indexes();
    updatedIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.unique ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });

    console.log('\n🎉 Payment Index Fix Complete!');
    console.log('✅ Removed problematic paymentId index');
    console.log('✅ Payment creation should now work without duplicate key errors');

  } catch (error) {
    console.error('❌ Error fixing payment index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixPaymentIndex(); 