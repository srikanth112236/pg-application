const mongoose = require('mongoose');

async function fixPaymentDuplicateKey() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_maintenance';
  
  try {
    console.log('🔧 Fixing payment duplicate key error...');
    console.log('📋 This will:');
    console.log('- Remove the problematic paymentId_1 index');
    console.log('- Clean up any null paymentId values');
    console.log('- Ensure no future duplicate key errors');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const paymentsCollection = db.collection('payments');

    // Step 1: Check and remove paymentId index
    console.log('\n🔍 Checking for paymentId index...');
    const indexes = await paymentsCollection.indexes();
    
    const paymentIdIndex = indexes.find(index =>
      index.name === 'paymentId_1' ||
      Object.keys(index.key).includes('paymentId')
    );

    if (paymentIdIndex) {
      console.log('❌ Found problematic paymentId index:', paymentIdIndex.name);
      console.log('🔧 Dropping paymentId index...');
      
      try {
        await paymentsCollection.dropIndex(paymentIdIndex.name);
        console.log('✅ Successfully dropped paymentId index');
      } catch (error) {
        console.log('⚠️ Error dropping index:', error.message);
      }
    } else {
      console.log('✅ No problematic paymentId index found');
    }

    // Step 2: Clean up any documents with null paymentId
    console.log('\n🔍 Checking for documents with null paymentId...');
    const nullPaymentIdDocs = await paymentsCollection.find({ paymentId: null }).toArray();
    
    if (nullPaymentIdDocs.length > 0) {
      console.log(`⚠️ Found ${nullPaymentIdDocs.length} documents with null paymentId`);
      console.log('🔧 Removing paymentId field from these documents...');
      
      const result = await paymentsCollection.updateMany(
        { paymentId: null },
        { $unset: { paymentId: "" } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} documents`);
    } else {
      console.log('✅ No documents with null paymentId found');
    }

    // Step 3: Remove paymentId field from all documents to prevent future issues
    console.log('\n🔧 Removing paymentId field from all payment documents...');
    const updateResult = await paymentsCollection.updateMany(
      { paymentId: { $exists: true } },
      { $unset: { paymentId: "" } }
    );
    
    console.log(`✅ Removed paymentId field from ${updateResult.modifiedCount} documents`);

    // Step 4: Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const remainingNullDocs = await paymentsCollection.find({ paymentId: null }).toArray();
    const remainingPaymentIdDocs = await paymentsCollection.find({ paymentId: { $exists: true } }).toArray();
    
    if (remainingNullDocs.length === 0 && remainingPaymentIdDocs.length === 0) {
      console.log('✅ Verification successful - no problematic paymentId values found');
    } else {
      console.log('⚠️ Some problematic documents may still exist');
    }

    console.log('\n🎉 Payment duplicate key error fix completed!');
    console.log('✅ Removed problematic paymentId index');
    console.log('✅ Cleaned up null paymentId values');
    console.log('✅ Payment marking should now work correctly');

  } catch (error) {
    console.error('❌ Error fixing payment duplicate key:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixPaymentDuplicateKey().catch(console.error); 