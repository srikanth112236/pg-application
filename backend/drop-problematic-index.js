const mongoose = require('mongoose');
require('dotenv').config();

async function dropProblematicIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database connection
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    console.log('🗑️ Dropping problematic index...');
    try {
      await db.collection('branches').dropIndex('pgId_1_isDefault_1');
      console.log('✅ Successfully dropped pgId_1_isDefault_1 index');
    } catch (error) {
      console.log('ℹ️ Index not found or already dropped:', error.message);
    }

    // List remaining indexes
    console.log('\n📋 Remaining indexes:');
    const indexes = await db.collection('branches').indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n🎉 Index fix completed! The set-default functionality should now work.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

dropProblematicIndex();
