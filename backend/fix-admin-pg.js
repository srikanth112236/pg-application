const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');

async function fixAdminPG() {
  try {
    console.log('🔧 Fixing admin PG association...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email);

    // Check if admin has a PG
    if (!adminUser.pgId) {
      console.log('📝 Creating test PG...');
      
      // Create a test PG
      const testPG = new PG({
        name: 'Test PG',
        description: 'A test PG for development',
        address: '123 Test Street, Test City, Test State 123456',
        phone: '9876543210',
        email: 'testpg@example.com',
        createdBy: adminUser._id
      });

      await testPG.save();
      console.log('✅ Created test PG:', testPG.name);

      // Update admin user with PG
      adminUser.pgId = testPG._id;
      await adminUser.save();
      console.log('✅ Associated PG with admin user');
    } else {
      console.log('✅ Admin already has PG:', adminUser.pgId);
    }

    console.log('🎉 Admin PG fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAdminPG(); 