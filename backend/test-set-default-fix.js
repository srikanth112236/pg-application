const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
const PG = require('./src/models/pg.model');
const User = require('./src/models/user.model');
require('dotenv').config();

async function testSetDefaultFix() {
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

    // Get existing branches
    console.log('\n🧪 Getting existing branches...');
    const branchesResult = await BranchService.getBranchesByPG(pg._id);
    
    if (!branchesResult.success || branchesResult.data.length < 2) {
      console.log('❌ Need at least 2 branches to test set-default functionality');
      console.log('📋 Current branches:', branchesResult.data?.length || 0);
      return;
    }

    const branches = branchesResult.data;
    console.log(`✅ Found ${branches.length} branches`);

    // Test setting default branch
    console.log('\n🧪 Testing set-default functionality...');
    
    // Find a non-default branch to set as default
    const nonDefaultBranch = branches.find(b => !b.isDefault);
    if (!nonDefaultBranch) {
      console.log('❌ No non-default branch found to test with');
      return;
    }

    console.log(`🎯 Setting branch "${nonDefaultBranch.name}" as default...`);
    
    const setDefaultResult = await BranchService.setDefaultBranch(nonDefaultBranch._id, user._id);
    
    if (setDefaultResult.success) {
      console.log('✅ Successfully set branch as default!');
      console.log('📋 Updated branch:', setDefaultResult.data.name);
      console.log('🔧 isDefault:', setDefaultResult.data.isDefault);
      } else {
      console.log('❌ Failed to set branch as default');
      console.log('📋 Error:', setDefaultResult.message);
      console.log('🔍 Details:', setDefaultResult.error);
    }

    // Verify the change
    console.log('\n🧪 Verifying the change...');
    const verifyResult = await BranchService.getBranchesByPG(pg._id);
    if (verifyResult.success) {
      const defaultBranches = verifyResult.data.filter(b => b.isDefault);
      console.log(`✅ Found ${defaultBranches.length} default branch(es)`);
      defaultBranches.forEach(b => {
        console.log(`   - ${b.name} (${b._id})`);
      });
    }

    console.log('\n🎉 Set-default test completed!');

  } catch (error) {
    console.error('❌ Error during set-default test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSetDefaultFix();
