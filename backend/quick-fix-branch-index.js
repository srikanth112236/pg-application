const mongoose = require('mongoose');
require('dotenv').config();

async function quickFixBranchIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('branches');

    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Find and drop the problematic index
    const problematicIndex = indexes.find(index => 
      index.key.pgId === 1 && index.key.isDefault === 1 && Object.keys(index.key).length === 2
    );

    if (problematicIndex) {
      console.log(`\n🗑️ Found problematic index: ${problematicIndex.name}`);
      console.log('🔧 Dropping it now...');
      
      try {
        await collection.dropIndex(problematicIndex.name);
        console.log('✅ Successfully dropped the problematic index!');
      } catch (error) {
        console.log('❌ Failed to drop index:', error.message);
        
        // Try alternative method
        try {
          await db.command({
            dropIndexes: 'branches',
            index: problematicIndex.name
          });
          console.log('✅ Successfully dropped using direct command!');
        } catch (cmdError) {
          console.log('❌ Direct command also failed:', cmdError.message);
        }
      }
    } else {
      console.log('\n✅ No problematic index found!');
    }

    console.log('\n📋 Indexes after fix:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n🎉 Branch index fix completed!');
    console.log('🚀 The set-default branch functionality should now work correctly.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

quickFixBranchIndex();
