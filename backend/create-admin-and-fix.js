const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');

async function createAdminAndFix() {
  try {
    console.log('🔧 Creating Admin User and Fixing PG Association...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance');
    console.log('✅ Connected to MongoDB');

    // Step 1: Create Admin User
    console.log('\n📋 Step 1: Creating Admin User...');
    
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);
      
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '1234567890',
        role: 'admin',
        isActive: true,
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          pincode: '123456',
          country: 'India'
        }
      });
      
      await adminUser.save();
      console.log('✅ Created admin user:', adminUser.email);
    } else {
      console.log('👤 Found existing admin user:', adminUser.email);
    }

    console.log('📊 Current pgId:', adminUser.pgId);

    // Step 2: Create PG for Admin
    console.log('\n📋 Step 2: Creating PG for Admin...');
    
    let pg = await PG.findOne({ createdBy: adminUser._id });
    if (!pg) {
      console.log('🏠 Creating PG for admin user...');
      pg = new PG({
        name: 'Admin PG',
        description: 'Default PG for admin',
        address: 'Default Address',
        phone: adminUser.phone || '1234567890',
        email: adminUser.email,
        createdBy: adminUser._id
      });
      await pg.save();
      console.log('✅ Created PG:', pg._id);
    } else {
      console.log('🏠 Found existing PG:', pg._id);
    }

    // Step 3: Update user's pgId
    console.log('\n📋 Step 3: Updating User PG Association...');
    
    if (!adminUser.pgId || adminUser.pgId.toString() !== pg._id.toString()) {
      console.log('🔗 Updating user pgId...');
      adminUser.pgId = pg._id;
      await adminUser.save();
      console.log('✅ Updated user pgId');
    } else {
      console.log('✅ User pgId is already correct');
    }

    // Step 4: Create Default Branch
    console.log('\n📋 Step 4: Creating Default Branch...');
    
    let defaultBranch = await Branch.findOne({ pgId: pg._id, isDefault: true });
    if (!defaultBranch) {
      console.log('🏢 Creating default branch...');
      defaultBranch = new Branch({
        pgId: pg._id,
        name: 'Main Branch',
        address: {
          street: 'Main Street',
          city: 'Default City',
          state: 'Default State',
          pincode: '123456',
          landmark: 'Near Main Road'
        },
        maintainer: {
          name: adminUser.firstName + ' ' + adminUser.lastName,
          mobile: adminUser.phone || '1234567890',
          email: adminUser.email
        },
        contact: {
          phone: adminUser.phone || '1234567890',
          email: adminUser.email,
          alternatePhone: ''
        },
        capacity: {
          totalRooms: 10,
          totalBeds: 20,
          availableRooms: 10
        },
        amenities: ['WiFi', 'AC', 'Food'],
        status: 'active',
        isDefault: true,
        isActive: true,
        createdBy: adminUser._id
      });
      await defaultBranch.save();
      console.log('✅ Created default branch:', defaultBranch._id);
    } else {
      console.log('🏢 Found existing default branch:', defaultBranch._id);
    }

    // Step 5: Verification
    console.log('\n📋 Step 5: Final Verification...');
    
    const updatedUser = await User.findById(adminUser._id);
    const userPG = await PG.findById(updatedUser.pgId);
    const userBranches = await Branch.find({ pgId: updatedUser.pgId });

    console.log('👤 User pgId:', updatedUser.pgId);
    console.log('🏠 PG exists:', !!userPG);
    console.log('🏢 Branches count:', userBranches.length);
    console.log('⭐ Default branch:', userBranches.find(b => b.isDefault)?.name || 'None');

    console.log('\n✅ Admin user created and PG association fixed!');
    console.log('🔑 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('🚀 You can now login and use the branch management features.');
    
  } catch (error) {
    console.error('❌ Error creating admin and fixing PG association:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminAndFix(); 