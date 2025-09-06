const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Activity = require('./backend/src/models/activity.model');
const User = require('./backend/src/models/user.model');

async function testAdminActivities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-management');
    console.log('✅ Connected to MongoDB');

    // Get the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    console.log('👤 Admin User:', adminUser ? {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      branchId: adminUser.branchId
    } : 'No admin user found');

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Check all activities in the database
    const allActivities = await Activity.find({}).sort({ timestamp: -1 }).limit(10);
    console.log('\n📊 All Activities in Database:');
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
    });

    // Check activities for this specific admin user
    const adminActivities = await Activity.find({ 
      userId: adminUser._id 
    }).sort({ timestamp: -1 }).limit(10);
    console.log('\n👤 Activities for Admin User:');
    adminActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
    });

    // Check activities by userRole = 'admin'
    const adminRoleActivities = await Activity.find({ 
      userRole: 'admin' 
    }).sort({ timestamp: -1 }).limit(10);
    console.log('\n🔍 Activities with userRole = "admin":');
    adminRoleActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
    });

    // Check activities by branchId
    if (adminUser.branchId) {
      const branchActivities = await Activity.find({ 
        branchId: adminUser.branchId 
      }).sort({ timestamp: -1 }).limit(10);
      console.log('\n🏢 Activities for Branch:', adminUser.branchId);
      branchActivities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
      });
    }

    // Test the exact query that getAdminActivities uses
    const adminFilters = {
      userRole: 'admin'
    };
    
    if (adminUser.branchId) {
      adminFilters.branchId = adminUser.branchId;
    }

    const filteredActivities = await Activity.find(adminFilters)
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    console.log('\n🎯 Filtered Activities (getAdminActivities query):');
    console.log('Query:', adminFilters);
    console.log('Results:', filteredActivities.length);
    filteredActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAdminActivities();
