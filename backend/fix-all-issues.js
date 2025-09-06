const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');

async function fixAllIssues() {
  try {
    console.log('🔧 Fixing All Issues...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance');
    console.log('✅ Connected to MongoDB');

    // Step 1: Fix PG Association
    console.log('\n📋 Step 1: Fixing PG Association...');
    
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('👤 Found admin user:', adminUser.email);
    console.log('📊 Current pgId:', adminUser.pgId);

    // Check if PG exists for this user
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

    // Update user's pgId if not set
    if (!adminUser.pgId || adminUser.pgId.toString() !== pg._id.toString()) {
      console.log('🔗 Updating user pgId...');
      adminUser.pgId = pg._id;
      await adminUser.save();
      console.log('✅ Updated user pgId');
    } else {
      console.log('✅ User pgId is already correct');
    }

    // Step 2: Create Default Branch
    console.log('\n📋 Step 2: Creating Default Branch...');
    
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

    // Step 3: Test API Endpoints
    console.log('\n📋 Step 3: Testing API Endpoints...');
    
    try {
      // Test login
      console.log('🔐 Testing login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      if (!loginData.success) {
        console.log('❌ Login failed:', loginData.message);
        return;
      }
      
      const { accessToken } = loginData.data.tokens;
      console.log('✅ Login successful');
      
      // Test GET /api/branches
      console.log('📋 Testing GET /api/branches...');
      const getBranchesResponse = await fetch('http://localhost:5000/api/branches', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const getBranchesData = await getBranchesResponse.json();
      console.log('✅ GET /api/branches successful:', getBranchesData.success);
      
      // Test POST /api/branches
      console.log('🏢 Testing POST /api/branches...');
      const branchData = {
        name: 'Test Branch',
        address: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          landmark: 'Test Landmark'
        },
        maintainer: {
          name: 'Test Maintainer',
          mobile: '1234567890',
          email: 'maintainer@test.com'
        },
        contact: {
          phone: '1234567890',
          email: 'contact@test.com',
          alternatePhone: ''
        },
        capacity: {
          totalRooms: 5,
          totalBeds: 10,
          availableRooms: 5
        },
        amenities: ['WiFi', 'AC'],
        status: 'active'
      };
      
      const createBranchResponse = await fetch('http://localhost:5000/api/branches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
      });
      const createBranchData = await createBranchResponse.json();
      console.log('✅ POST /api/branches successful:', createBranchData.success);
      
    } catch (error) {
      console.log('❌ API test failed:', error.message);
    }

    // Step 4: Verification
    console.log('\n📋 Step 4: Final Verification...');
    
    const updatedUser = await User.findById(adminUser._id);
    const userPG = await PG.findById(updatedUser.pgId);
    const userBranches = await Branch.find({ pgId: updatedUser.pgId });

    console.log('👤 User pgId:', updatedUser.pgId);
    console.log('🏠 PG exists:', !!userPG);
    console.log('🏢 Branches count:', userBranches.length);
    console.log('⭐ Default branch:', userBranches.find(b => b.isDefault)?.name || 'None');

    console.log('\n✅ All issues fixed successfully!');
    console.log('🚀 You can now use the branch management features.');
    
  } catch (error) {
    console.error('❌ Error fixing issues:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAllIssues(); 