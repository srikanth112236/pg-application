const mongoose = require('mongoose');
const Branch = require('./src/models/branch.model');
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
require('dotenv').config();

async function testBranchFix() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test PG and admin user
    const pg = await PG.findOne();
    const adminUser = await User.findOne({ role: 'admin' });

    if (!pg || !adminUser) {
      console.log('❌ No PG or admin user found. Please run setup scripts first.');
      return;
    }

    console.log('🏠 Found PG:', pg.name);
    console.log('👤 Found admin user:', adminUser.email);

    // Get existing branches
    const branches = await Branch.find({ pgId: pg._id, isActive: true });
    console.log(`📋 Found ${branches.length} active branches`);

    if (branches.length < 2) {
      console.log('❌ Need at least 2 branches to test. Please create more branches first.');
      return;
    }

    const branch1 = branches[0];
    const branch2 = branches[1];

    console.log(`🏢 Testing with branches: ${branch1.name} and ${branch2.name}`);

    // Test the setDefaultBranch function
    console.log('\n🧪 Testing setDefaultBranch function...');
    const BranchService = require('./src/services/branch.service');

    // First, ensure no branch is default
    console.log('🔄 Resetting all branches to non-default...');
    await Branch.updateMany({ pgId: pg._id }, { isDefault: false });
    console.log('✅ Reset complete');

    // Test setting branch1 as default
    console.log(`🔄 Setting "${branch1.name}" as default...`);
    const result1 = await BranchService.setDefaultBranch(branch1._id, adminUser._id);
    
    if (result1.success) {
      console.log('✅ Successfully set branch1 as default');
      
      // Verify the change
      const updatedBranch1 = await Branch.findById(branch1._id);
      const updatedBranch2 = await Branch.findById(branch2._id);
      
      console.log(`📋 ${branch1.name} isDefault:`, updatedBranch1.isDefault);
      console.log(`📋 ${branch2.name} isDefault:`, updatedBranch2.isDefault);
      
      // Test setting branch2 as default
      console.log(`\n🔄 Setting "${branch2.name}" as default...`);
      const result2 = await BranchService.setDefaultBranch(branch2._id, adminUser._id);
      
      if (result2.success) {
        console.log('✅ Successfully set branch2 as default');
        
        // Verify the change
        const finalBranch1 = await Branch.findById(branch1._id);
        const finalBranch2 = await Branch.findById(branch2._id);
        
        console.log(`📋 ${branch1.name} isDefault:`, finalBranch1.isDefault);
        console.log(`📋 ${branch2.name} isDefault:`, finalBranch2.isDefault);
        
        console.log('\n🎉 All tests passed! Set default functionality is working correctly.');
      } else {
        console.log('❌ Failed to set branch2 as default:', result2.message);
      }
    } else {
      console.log('❌ Failed to set branch1 as default:', result1.message);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBranchFix();
