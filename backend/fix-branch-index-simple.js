const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
require('dotenv').config();

async function fixBranchIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Try to drop the problematic index
    try {
      await Branch.collection.dropIndex('pgId_1_isDefault_1');
      console.log('✅ Successfully dropped pgId_1_isDefault_1 index');
    } catch (error) {
      console.log('ℹ️ Index pgId_1_isDefault_1 does not exist or could not be dropped:', error.message);
    }

    // List current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await Branch.collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n🎉 Branch index fix completed!');
    console.log('🚀 The set-default branch functionality should now work correctly.');

  } catch (error) {
    console.error('❌ Error fixing branch index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixBranchIndex();
