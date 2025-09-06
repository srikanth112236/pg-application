const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Resident = require('./src/models/resident.model');
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');

async function testBulkUploadDebug() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if residents exist in database
    console.log('\n🔍 Test 1: Checking all residents in database...');
    const allResidents = await Resident.find({}).populate('pgId branchId');
    console.log(`📊 Total residents in database: ${allResidents.length}`);
    
    if (allResidents.length > 0) {
      console.log('📋 Sample residents:');
      allResidents.slice(0, 3).forEach((resident, index) => {
        console.log(`  ${index + 1}. ${resident.firstName} ${resident.lastName}`);
        console.log(`     Email: ${resident.email}`);
        console.log(`     PG: ${resident.pgId?.name || 'No PG'}`);
        console.log(`     Branch: ${resident.branchId?.name || 'No Branch'}`);
        console.log(`     Status: ${resident.status}`);
        console.log(`     isActive: ${resident.isActive}`);
        console.log(`     Created: ${resident.createdAt}`);
        console.log('');
      });
    }

    // Test 2: Check residents by PG
    console.log('\n🔍 Test 2: Checking residents by PG...');
    const pgs = await PG.find({});
    console.log(`📊 Total PGs: ${pgs.length}`);
    
    for (const pg of pgs) {
      const pgResidents = await Resident.find({ pgId: pg._id });
      console.log(`🏠 PG "${pg.name}" (${pg._id}): ${pgResidents.length} residents`);
      
      if (pgResidents.length > 0) {
        const byBranch = {};
        pgResidents.forEach(resident => {
          const branchId = resident.branchId?.toString() || 'no-branch';
          byBranch[branchId] = (byBranch[branchId] || 0) + 1;
        });
        console.log(`   📍 By branch:`, byBranch);
      }
    }

    // Test 3: Check residents by branch
    console.log('\n🔍 Test 3: Checking residents by branch...');
    const branches = await Branch.find({});
    console.log(`📊 Total branches: ${branches.length}`);
    
    for (const branch of branches) {
      const branchResidents = await Resident.find({ branchId: branch._id });
      console.log(`🏢 Branch "${branch.name}" (${branch._id}): ${branchResidents.length} residents`);
      
      if (branchResidents.length > 0) {
        const byStatus = {};
        branchResidents.forEach(resident => {
          byStatus[resident.status] = (byStatus[resident.status] || 0) + 1;
        });
        console.log(`   📊 By status:`, byStatus);
      }
    }

    // Test 4: Check for residents with missing branchId
    console.log('\n🔍 Test 4: Checking residents with missing branchId...');
    const residentsWithoutBranch = await Resident.find({ branchId: { $exists: false } });
    console.log(`❌ Residents without branchId: ${residentsWithoutBranch.length}`);
    
    if (residentsWithoutBranch.length > 0) {
      console.log('📋 Sample residents without branchId:');
      residentsWithoutBranch.slice(0, 3).forEach((resident, index) => {
        console.log(`  ${index + 1}. ${resident.firstName} ${resident.lastName} (${resident._id})`);
        console.log(`     PG: ${resident.pgId}`);
        console.log(`     Created: ${resident.createdAt}`);
      });
    }

    // Test 5: Check for residents with missing pgId
    console.log('\n🔍 Test 5: Checking residents with missing pgId...');
    const residentsWithoutPG = await Resident.find({ pgId: { $exists: false } });
    console.log(`❌ Residents without pgId: ${residentsWithoutPG.length}`);

    // Test 6: Check database indexes
    console.log('\n🔍 Test 6: Checking database indexes...');
    const indexes = await Resident.collection.getIndexes();
    console.log('📊 Resident collection indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`  - ${indexName}:`, indexes[indexName]);
    });

    console.log('\n✅ Debug test completed');

  } catch (error) {
    console.error('❌ Error in debug test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBulkUploadDebug();
