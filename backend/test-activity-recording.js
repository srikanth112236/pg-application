const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const Activity = require('./src/models/activity.model');
const User = require('./src/models/user.model');
const ActivityService = require('./src/services/activity.service');

async function testActivityRecording() {
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
      pgId: adminUser.pgId,
      branchId: adminUser.branchId
    } : 'No admin user found');

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Get the default branch for the admin's PG
    let defaultBranch = null;
    if (adminUser.pgId) {
      const Branch = require('./src/models/branch.model');
      defaultBranch = await Branch.findOne({ pgId: adminUser.pgId, isDefault: true });
      console.log('🏢 Default Branch for PG:', defaultBranch ? {
        id: defaultBranch._id,
        name: defaultBranch.name,
        isDefault: defaultBranch.isDefault
      } : 'No default branch found');
    }

    // Initialize activity service (it's already an instance)
    const activityService = ActivityService;

    // Test recording an activity
    console.log('\n🧪 Testing activity recording...');
    const testActivity = await activityService.recordActivity({
      type: 'user_login',
      title: 'Test Login Activity',
      description: 'Test activity for debugging',
      userId: adminUser._id,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      branchId: defaultBranch?._id,
      category: 'authentication',
      priority: 'normal',
      status: 'success'
    });

    console.log('✅ Test activity recorded:', testActivity._id);

    // Check if the activity was saved
    const savedActivity = await Activity.findById(testActivity._id);
    console.log('🔍 Saved activity:', savedActivity ? {
      id: savedActivity._id,
      title: savedActivity.title,
      userEmail: savedActivity.userEmail,
      userRole: savedActivity.userRole,
      branchId: savedActivity.branchId,
      timestamp: savedActivity.timestamp
    } : 'Activity not found');

    // Test the getAdminActivities method
    console.log('\n🧪 Testing getAdminActivities...');
    const adminActivities = await activityService.getAdminActivities({}, {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      branchId: defaultBranch?._id
    });

    console.log('🔍 Admin activities result:', {
      activitiesCount: adminActivities.activities?.length || 0,
      pagination: adminActivities.pagination
    });

    if (adminActivities.activities && adminActivities.activities.length > 0) {
      console.log('📋 Activities found:');
      adminActivities.activities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title} - ${activity.userEmail} (${activity.userRole}) - ${activity.timestamp}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testActivityRecording();
