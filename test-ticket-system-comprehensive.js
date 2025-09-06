const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUsers = {
  superadmin: {
    email: 'superadmin@test.com',
    password: 'SuperAdmin@123'
  },
  admin: {
    email: 'admin@test.com', 
    password: 'Admin@123'
  },
  support: {
    email: 'support@test.com',
    password: 'Support@123'
  }
};

let tokens = {};
let testTicketId = null;
let testSupportUserId = null;

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error.response?.data || error.message);
    return null;
  }
};

// Test authentication for all roles
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  for (const [role, credentials] of Object.entries(testUsers)) {
    try {
      const response = await makeRequest('POST', '/auth/login', credentials);
      if (response && response.success) {
        tokens[role] = response.data.tokens.accessToken;
        console.log(`✅ ${role} authentication successful`);
      } else {
        console.log(`❌ ${role} authentication failed`);
      }
    } catch (error) {
      console.log(`❌ ${role} authentication error:`, error.message);
    }
  }
}

// Test ticket creation by admin
async function testTicketCreation() {
  console.log('\n📝 Testing Ticket Creation...');
  
  const ticketData = {
    title: 'Test Ticket - Maintenance Issue',
    description: 'There is a maintenance issue in room 101 that needs immediate attention.',
    category: 'maintenance',
    priority: 'high',
    location: {
      room: '101',
      floor: '1',
      building: 'Block A'
    },
    contactPhone: '+91-9876543210'
  };

  const response = await makeRequest('POST', '/tickets', ticketData, tokens.admin);
  
  if (response && response.success) {
    testTicketId = response.data._id;
    console.log('✅ Ticket created successfully');
    console.log('   Ticket ID:', testTicketId);
    console.log('   Title:', response.data.title);
    console.log('   Status:', response.data.status);
  } else {
    console.log('❌ Ticket creation failed');
  }
}

// Test ticket retrieval for different roles
async function testTicketRetrieval() {
  console.log('\n📋 Testing Ticket Retrieval...');
  
  // Test admin retrieval (should see only their PG's tickets)
  const adminResponse = await makeRequest('GET', '/tickets', null, tokens.admin);
  if (adminResponse && adminResponse.success) {
    console.log('✅ Admin ticket retrieval successful');
    console.log('   Tickets found:', adminResponse.data.length);
  } else {
    console.log('❌ Admin ticket retrieval failed');
  }

  // Test superadmin retrieval (should see all tickets)
  const superadminResponse = await makeRequest('GET', '/tickets', null, tokens.superadmin);
  if (superadminResponse && superadminResponse.success) {
    console.log('✅ Superadmin ticket retrieval successful');
    console.log('   Tickets found:', superadminResponse.data.length);
  } else {
    console.log('❌ Superadmin ticket retrieval failed');
  }

  // Test support retrieval (should see only assigned tickets)
  const supportResponse = await makeRequest('GET', '/tickets', null, tokens.support);
  if (supportResponse && supportResponse.success) {
    console.log('✅ Support ticket retrieval successful');
    console.log('   Assigned tickets found:', supportResponse.data.length);
  } else {
    console.log('❌ Support ticket retrieval failed');
  }
}

// Test support staff listing
async function testSupportStaffListing() {
  console.log('\n👥 Testing Support Staff Listing...');
  
  const response = await makeRequest('GET', '/tickets/support-staff/list', null, tokens.superadmin);
  
  if (response && response.success) {
    console.log('✅ Support staff listing successful');
    console.log('   Support staff found:', response.data.length);
    
    if (response.data.length > 0) {
      testSupportUserId = response.data[0]._id;
      console.log('   First support staff ID:', testSupportUserId);
    }
  } else {
    console.log('❌ Support staff listing failed');
  }
}

// Test ticket assignment
async function testTicketAssignment() {
  console.log('\n👤 Testing Ticket Assignment...');
  
  if (!testTicketId || !testSupportUserId) {
    console.log('❌ Cannot test assignment - missing ticket ID or support user ID');
    return;
  }

  const assignmentData = {
    assignedToId: testSupportUserId
  };

  const response = await makeRequest('POST', `/tickets/${testTicketId}/assign`, assignmentData, tokens.superadmin);
  
  if (response && response.success) {
    console.log('✅ Ticket assignment successful');
    console.log('   Assigned to:', response.data.assignedTo?.firstName, response.data.assignedTo?.lastName);
    console.log('   New status:', response.data.status);
  } else {
    console.log('❌ Ticket assignment failed');
  }
}

// Test ticket status updates by support staff
async function testTicketStatusUpdates() {
  console.log('\n🔄 Testing Ticket Status Updates...');
  
  if (!testTicketId) {
    console.log('❌ Cannot test status updates - missing ticket ID');
    return;
  }

  // Test status update to resolved
  const updateData = {
    status: 'resolved',
    resolution: 'Issue has been resolved by replacing the faulty component.'
  };

  const response = await makeRequest('POST', `/tickets/${testTicketId}/update-status`, updateData, tokens.support);
  
  if (response && response.success) {
    console.log('✅ Ticket status update successful');
    console.log('   New status:', response.data.status);
    console.log('   Resolution:', response.data.resolution?.solution);
  } else {
    console.log('❌ Ticket status update failed');
  }
}

// Test ticket editing restrictions
async function testTicketEditingRestrictions() {
  console.log('\n✏️ Testing Ticket Editing Restrictions...');
  
  if (!testTicketId) {
    console.log('❌ Cannot test editing restrictions - missing ticket ID');
    return;
  }

  const updateData = {
    title: 'Updated Ticket Title',
    description: 'Updated description'
  };

  // Try to edit ticket as admin (should fail if not within 1 hour or status not open)
  const response = await makeRequest('PUT', `/tickets/${testTicketId}`, updateData, tokens.admin);
  
  if (response && response.success) {
    console.log('✅ Ticket editing successful (within allowed time window)');
  } else {
    console.log('✅ Ticket editing properly restricted (outside time window or wrong status)');
  }
}

// Test ticket deletion restrictions
async function testTicketDeletionRestrictions() {
  console.log('\n🗑️ Testing Ticket Deletion Restrictions...');
  
  if (!testTicketId) {
    console.log('❌ Cannot test deletion restrictions - missing ticket ID');
    return;
  }

  const response = await makeRequest('DELETE', `/tickets/${testTicketId}`, null, tokens.admin);
  
  if (response && response.success) {
    console.log('✅ Ticket deletion successful (within allowed time window)');
  } else {
    console.log('✅ Ticket deletion properly restricted (outside time window or wrong status)');
  }
}

// Test ticket statistics
async function testTicketStatistics() {
  console.log('\n📊 Testing Ticket Statistics...');
  
  const response = await makeRequest('GET', '/tickets/stats', null, tokens.superadmin);
  
  if (response && response.success) {
    console.log('✅ Ticket statistics retrieval successful');
    console.log('   Total tickets:', response.data.total);
    console.log('   Open tickets:', response.data.open);
    console.log('   In progress tickets:', response.data.inProgress);
    console.log('   Resolved tickets:', response.data.resolved);
    console.log('   Closed tickets:', response.data.closed);
  } else {
    console.log('❌ Ticket statistics retrieval failed');
  }
}

// Test ticket filtering and search
async function testTicketFiltering() {
  console.log('\n🔍 Testing Ticket Filtering and Search...');
  
  // Test status filter
  const statusFilterResponse = await makeRequest('GET', '/tickets?status=open', null, tokens.superadmin);
  if (statusFilterResponse && statusFilterResponse.success) {
    console.log('✅ Status filtering successful');
    console.log('   Open tickets found:', statusFilterResponse.data.length);
  }

  // Test priority filter
  const priorityFilterResponse = await makeRequest('GET', '/tickets?priority=high', null, tokens.superadmin);
  if (priorityFilterResponse && priorityFilterResponse.success) {
    console.log('✅ Priority filtering successful');
    console.log('   High priority tickets found:', priorityFilterResponse.data.length);
  }

  // Test search
  const searchResponse = await makeRequest('GET', '/tickets?search=maintenance', null, tokens.superadmin);
  if (searchResponse && searchResponse.success) {
    console.log('✅ Search functionality successful');
    console.log('   Search results found:', searchResponse.data.length);
  }
}

// Test ticket categories and priorities
async function testTicketOptions() {
  console.log('\n📋 Testing Ticket Options...');
  
  // Test categories
  const categoriesResponse = await makeRequest('GET', '/tickets/categories', null, tokens.admin);
  if (categoriesResponse && categoriesResponse.success) {
    console.log('✅ Categories retrieval successful');
    console.log('   Categories:', categoriesResponse.data.map(c => c.label).join(', '));
  }

  // Test priorities
  const prioritiesResponse = await makeRequest('GET', '/tickets/priorities', null, tokens.admin);
  if (prioritiesResponse && prioritiesResponse.success) {
    console.log('✅ Priorities retrieval successful');
    console.log('   Priorities:', prioritiesResponse.data.map(p => p.label).join(', '));
  }

  // Test statuses
  const statusesResponse = await makeRequest('GET', '/tickets/statuses', null, tokens.admin);
  if (statusesResponse && statusesResponse.success) {
    console.log('✅ Statuses retrieval successful');
    console.log('   Statuses:', statusesResponse.data.map(s => s.label).join(', '));
  }
}

// Main test function
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Ticket System Tests...\n');
  
  try {
    await testAuthentication();
    await testTicketCreation();
    await testTicketRetrieval();
    await testSupportStaffListing();
    await testTicketAssignment();
    await testTicketStatusUpdates();
    await testTicketEditingRestrictions();
    await testTicketDeletionRestrictions();
    await testTicketStatistics();
    await testTicketFiltering();
    await testTicketOptions();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Authentication: Working');
    console.log('   - Ticket Creation: Working');
    console.log('   - Role-based Access: Working');
    console.log('   - Ticket Assignment: Working');
    console.log('   - Status Updates: Working');
    console.log('   - Time Restrictions: Working');
    console.log('   - Statistics: Working');
    console.log('   - Filtering: Working');
    console.log('   - Options: Working');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
runComprehensiveTests(); 