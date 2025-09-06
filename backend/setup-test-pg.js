const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');

async function setupTestPG() {
  try {
    console.log('🔧 Setting up test PG...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please create admin user first.');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email);

    // Check if admin already has a PG
    if (adminUser.pgId) {
      console.log('✅ Admin already has a PG associated');
      return;
    }

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

    // Associate PG with admin user
    adminUser.pgId = testPG._id;
    await adminUser.save();
    console.log('✅ Associated PG with admin user');

    console.log('🎉 Test PG setup completed successfully!');
    console.log('📋 PG Details:');
    console.log('   - Name:', testPG.name);
    console.log('   - Address:', testPG.address);
    console.log('   - Phone:', testPG.phone);
    console.log('   - Email:', testPG.email);

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setupTestPG(); 