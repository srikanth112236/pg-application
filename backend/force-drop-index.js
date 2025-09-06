const mongoose = require('mongoose');
require('dotenv').config();

async function forceDropIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('branches');

    // List all current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Force drop the problematic index
    console.log('\n🗑️ Force dropping the problematic index...');
    
    try {
      // Method 1: Try to drop by name
      await collection.dropIndex('pgId_1_isDefault_1');
      console.log('✅ Successfully dropped pgId_1_isDefault_1 index');
    } catch (error) {
      console.log('ℹ️ Could not drop by name, trying alternative methods...');
      
      try {
        // Method 2: Try to drop by key specification
        await collection.dropIndex({ pgId: 1, isDefault: 1 });
        console.log('✅ Successfully dropped index using key specification');
      } catch (error2) {
        console.log('ℹ️ Could not drop by key, trying direct database command...');
        
        try {
          // Method 3: Use direct database command
          await db.command({
            dropIndexes: 'branches',
            index: 'pgId_1_isDefault_1'
          });
          console.log('✅ Successfully dropped index using direct command');
        } catch (error3) {
          console.log('ℹ️ Could not drop using direct command, trying to find exact index name...');
          
          // Method 4: Find the exact index name and drop it
          const allIndexes = await collection.indexes();
          const problematicIndex = allIndexes.find(index => 
            index.key.pgId === 1 && index.key.isDefault === 1
          );
          
          if (problematicIndex) {
            console.log(`Found problematic index: ${problematicIndex.name}`);
            await collection.dropIndex(problematicIndex.name);
            console.log(`✅ Successfully dropped index: ${problematicIndex.name}`);
          } else {
            console.log('❌ Could not find the problematic index');
          }
        }
      }
    }

    // Verify the index is gone
    console.log('\n📋 Indexes after fix:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if the problematic index still exists
    const stillExists = newIndexes.find(index => 
      index.key.pgId === 1 && index.key.isDefault === 1 && Object.keys(index.key).length === 2
    );

    if (!stillExists) {
      console.log('\n✅ SUCCESS: The problematic index has been removed!');
      console.log('🚀 The set-default branch functionality should now work correctly.');
    } else {
      console.log('\n❌ FAILED: The problematic index still exists');
      console.log('🔍 Index details:', stillExists);
    }

  } catch (error) {
    console.error('❌ Error in force drop index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

forceDropIndex();
