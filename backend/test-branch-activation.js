const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
const PG = require('./src/models/pg.model');
const User = require('./src/models/user.model');
require('dotenv').config();

async function testBranchActivation() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a test PG and user
    const pg = await PG.findOne();
    const user = await User.findOne({ role: 'admin' });

    if (!pg || !user) {
      console.log('❌ No PG or admin user found for testing');
      return;
    }

    console.log(`📋 Testing with PG: ${pg.name} (${pg._id})`);
    console.log(`👤 Testing with User: ${user.firstName} ${user.lastName} (${user._id})`);

    // Import the branch service
    const BranchService = require('./src/services/branch.service');

    // Test 1: Create multiple branches
    console.log('\n🧪 Test 1: Creating multiple branches...');
    
    const branch1Data = {
      pgId: pg._id,
      name: 'Test Branch 1',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      maintainer: {
        name: 'Test Maintainer 1',
        mobile: '1234567890',
        email: 'maintainer1@test.com'
      },
      contact: {
        phone: '1234567890',
        email: 'contact1@test.com'
      }
    };

    const branch2Data = {
      pgId: pg._id,
      name: 'Test Branch 2',
      address: {
        street: '456 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      maintainer: {
        name: 'Test Maintainer 2',
        mobile: '0987654321',
        email: 'maintainer2@test.com'
      },
      contact: {
        phone: '0987654321',
        email: 'contact2@test.com'
      }
    };

    const result1 = await BranchService.createBranch(branch1Data, user._id);
    console.log('Branch 1 created:', result1.success ? '✅' : '❌', result1.message);

    const result2 = await BranchService.createBranch(branch2Data, user._id);
    console.log('Branch 2 created:', result2.success ? '✅' : '❌', result2.message);

    // Test 2: Get all branches
    console.log('\n🧪 Test 2: Getting all branches...');
    const branchesResult = await BranchService.getBranchesByPG(pg._id);
    console.log('Branches found:', branchesResult.success ? '✅' : '❌', branchesResult.data?.length || 0, 'branches');

    if (branchesResult.success && branchesResult.data.length >= 2) {
      const branch1 = branchesResult.data[0];
      const branch2 = branchesResult.data[1];

      // Test 3: Set default branch
      console.log('\n🧪 Test 3: Setting default branch...');
      const setDefaultResult = await BranchService.setDefaultBranch(branch2._id, user._id);
      console.log('Set default branch:', setDefaultResult.success ? '✅' : '❌', setDefaultResult.message);

      // Test 4: Deactivate branch
      console.log('\n🧪 Test 4: Deactivating branch...');
      const deactivateResult = await BranchService.deactivateBranch(branch1._id, user._id);
      console.log('Deactivate branch:', deactivateResult.success ? '✅' : '❌', deactivateResult.message);

      // Test 5: Get all branches (including inactive)
      console.log('\n🧪 Test 5: Getting all branches (including inactive)...');
      const allBranchesResult = await BranchService.getAllBranchesByPG(pg._id);
      console.log('All branches found:', allBranchesResult.success ? '✅' : '❌', allBranchesResult.data?.length || 0, 'branches');

      // Test 6: Activate branch
      console.log('\n🧪 Test 6: Activating branch...');
      const activateResult = await BranchService.activateBranch(branch1._id, user._id);
      console.log('Activate branch:', activateResult.success ? '✅' : '❌', activateResult.message);

      // Test 7: Get branch statistics
      console.log('\n🧪 Test 7: Getting branch statistics...');
      const statsResult = await BranchService.getBranchStats(pg._id);
      console.log('Branch stats:', statsResult.success ? '✅' : '❌', statsResult.data?.length || 0, 'branches');

      // Test 8: Get default branch
      console.log('\n🧪 Test 8: Getting default branch...');
      const defaultResult = await BranchService.getDefaultBranch(pg._id);
      console.log('Default branch:', defaultResult.success ? '✅' : '❌', defaultResult.data?.name || 'Not found');

      // Clean up: Delete test branches
      console.log('\n🧹 Cleaning up test branches...');
      await BranchService.deleteBranch(branch1._id, user._id);
      await BranchService.deleteBranch(branch2._id, user._id);
      console.log('✅ Test branches cleaned up');
    }

    console.log('\n🎉 All branch activation tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during branch activation test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBranchActivation();
