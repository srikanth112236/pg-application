const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
require('dotenv').config();

async function fixBranchIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the existing problematic index
    console.log('🗑️ Dropping existing unique index...');
    try {
      await Branch.collection.dropIndex('pgId_1_isDefault_1');
      console.log('✅ Dropped existing index');
    } catch (error) {
      console.log('ℹ️ Index not found or already dropped');
    }

    // Create the new partial index
    console.log('🔧 Creating new partial unique index...');
    await Branch.collection.createIndex(
      { pgId: 1, isDefault: 1 },
      { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { isDefault: true },
        name: 'pgId_1_isDefault_1_partial'
      }
    );
    console.log('✅ Created new partial unique index');

    // Verify the index was created
    console.log('📋 Listing indexes...');
    const indexes = await Branch.collection.indexes();
    const uniqueIndex = indexes.find(index => index.name === 'pgId_1_isDefault_1_partial');
    
    if (uniqueIndex) {
      console.log('✅ Index verification successful');
      console.log('📊 Index details:', JSON.stringify(uniqueIndex, null, 2));
    } else {
      console.log('❌ Index not found');
    }

    console.log('\n🎉 Branch index fix completed successfully!');
    console.log('🚀 The set-default branch functionality should now work correctly.');

  } catch (error) {
    console.error('❌ Error fixing branch index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixBranchIndex();
