const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
require('dotenv').config();

async function fixBranchIndexComplete() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // List all current indexes
    console.log('📋 Current indexes:');
    const currentIndexes = await Branch.collection.indexes();
    currentIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop ALL indexes except _id
    console.log('\n🗑️ Dropping all indexes except _id...');
    for (const index of currentIndexes) {
      if (index.name !== '_id_') {
        try {
          await Branch.collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`ℹ️ Could not drop index ${index.name}:`, error.message);
        }
      }
    }

    // Create new indexes without the problematic unique constraint
    console.log('\n🔧 Creating new indexes...');
    
    // Basic indexes
    await Branch.collection.createIndex({ pgId: 1, isActive: 1 });
    console.log('✅ Created index: pgId_1_isActive_1');
    
    await Branch.collection.createIndex({ createdBy: 1 });
    console.log('✅ Created index: createdBy_1');
    
    await Branch.collection.createIndex({ status: 1 });
    console.log('✅ Created index: status_1');

    // Create a compound index for default branch queries (without unique constraint)
    await Branch.collection.createIndex({ pgId: 1, isDefault: 1, isActive: 1 });
    console.log('✅ Created index: pgId_1_isDefault_1_isActive_1');

    // Verify the new indexes
    console.log('\n📋 New indexes:');
    const newIndexes = await Branch.collection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n🎉 Branch index fix completed successfully!');
    console.log('🚀 The set-default branch functionality should now work correctly.');
    console.log('⚠️ Note: Default branch uniqueness will be enforced at the application level.');

  } catch (error) {
    console.error('❌ Error fixing branch index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixBranchIndexComplete();
