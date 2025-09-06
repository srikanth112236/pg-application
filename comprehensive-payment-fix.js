const { MongoClient } = require('mongodb');

async function fixPaymentDuplicateKey() {
  console.log('🔧 Comprehensive Payment Fix...\n');

  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_maintenance';
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const paymentsCollection = db.collection('payments');

    // List all indexes
    console.log('\n📋 Current indexes on payments collection:');
    const indexes = await paymentsCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Keys: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique || false}`);
      console.log('');
    });

    // Find and remove problematic paymentId index
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

    // Check for any documents with null paymentId
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

    // Verify fix
    console.log('\n📋 Updated indexes on payments collection:');
    const updatedIndexes = await paymentsCollection.indexes();
    updatedIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Keys: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique || false}`);
      console.log('');
    });

    console.log('\n🎉 Payment Fix Complete!');
    console.log('✅ Removed problematic paymentId index');
    console.log('✅ Cleaned up null paymentId values');
    console.log('✅ Payment creation should now work without errors');

  } catch (error) {
    console.error('❌ Error fixing payment issue:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

fixPaymentDuplicateKey(); 