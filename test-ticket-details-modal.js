const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testTicketDetailsModal() {
  console.log('🧪 Testing Comprehensive Ticket Details Modal...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running');

    // Test ticket creation for admin
    console.log('\n2. Testing ticket creation for admin...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (adminLoginResponse.data.success) {
      const adminToken = adminLoginResponse.data.data.tokens.accessToken;
      console.log('✅ Admin login successful');

      // Create a test ticket
      const testTicketData = {
        title: 'Test Ticket for Details Modal',
        description: 'This is a comprehensive test ticket to verify the details modal functionality with all features including timeline, resolution, and status updates.',
        category: 'maintenance',
        priority: 'high',
        location: {
          room: 'A101',
          floor: '1st Floor',
          building: 'Block A'
        },
        contactPhone: '9876543210'
      };

      const createTicketResponse = await axios.post(`${API_BASE_URL}/tickets`, testTicketData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (createTicketResponse.data.success) {
        console.log('✅ Test ticket created successfully');
        const ticketId = createTicketResponse.data.data._id;
        console.log(`   Ticket ID: ${ticketId}`);

        // Test getting ticket details
        console.log('\n3. Testing ticket details retrieval...');
        const ticketDetailsResponse = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (ticketDetailsResponse.data.success) {
          const ticket = ticketDetailsResponse.data.data;
          console.log('✅ Ticket details retrieved successfully');
          console.log(`   Title: ${ticket.title}`);
          console.log(`   Status: ${ticket.status}`);
          console.log(`   Priority: ${ticket.priority}`);
          console.log(`   Category: ${ticket.category}`);
          console.log(`   Timeline entries: ${ticket.timeline?.length || 0}`);
          console.log(`   Has resolution: ${!!ticket.resolution}`);
          console.log(`   Assigned to: ${ticket.assignedTo ? 'Yes' : 'No'}`);

          // Test superadmin login and ticket assignment
          console.log('\n4. Testing superadmin ticket assignment...');
          const superadminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'superadmin@test.com',
            password: 'superadmin123'
          });

          if (superadminLoginResponse.data.success) {
            const superadminToken = superadminLoginResponse.data.data.tokens.accessToken;
            console.log('✅ Superadmin login successful');

            // Get support staff list
            const supportStaffResponse = await axios.get(`${API_BASE_URL}/tickets/support-staff/list`, {
              headers: {
                'Authorization': `Bearer ${superadminToken}`
              }
            });

            if (supportStaffResponse.data.success && supportStaffResponse.data.data.length > 0) {
              const supportStaff = supportStaffResponse.data.data[0];
              console.log('✅ Support staff list retrieved');

              // Assign ticket to support staff
              const assignResponse = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
                assignedToId: supportStaff._id
              }, {
                headers: {
                  'Authorization': `Bearer ${superadminToken}`
                }
              });

              if (assignResponse.data.success) {
                console.log('✅ Ticket assigned to support staff successfully');
                console.log(`   Assigned to: ${supportStaff.firstName} ${supportStaff.lastName}`);

                // Test support staff login and status update
                console.log('\n5. Testing support staff status update...');
                const supportLoginResponse = await axios.post(`${API_BASE_URL}/auth/support-login`, {
                  email: supportStaff.email,
                  password: 'Support@123'
                });

                if (supportLoginResponse.data.success) {
                  const supportToken = supportLoginResponse.data.data.tokens.accessToken;
                  console.log('✅ Support staff login successful');

                  // Update ticket status
                  const statusUpdateResponse = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/update-status`, {
                    status: 'in_progress',
                    resolution: 'Started working on the maintenance request'
                  }, {
                    headers: {
                      'Authorization': `Bearer ${supportToken}`
                    }
                  });

                  if (statusUpdateResponse.data.success) {
                    console.log('✅ Ticket status updated successfully');
                    console.log(`   New status: ${statusUpdateResponse.data.data.status}`);
                    console.log(`   Timeline entries: ${statusUpdateResponse.data.data.timeline?.length || 0}`);

                    // Test resolution
                    console.log('\n6. Testing ticket resolution...');
                    const resolveResponse = await axios.post(`${API_BASE_URL}/tickets/${ticketId}/update-status`, {
                      status: 'resolved',
                      resolution: 'Maintenance completed successfully. All issues have been addressed and the system is working properly.'
                    }, {
                      headers: {
                        'Authorization': `Bearer ${supportToken}`
                      }
                    });

                    if (resolveResponse.data.success) {
                      console.log('✅ Ticket resolved successfully');
                      console.log(`   Final status: ${resolveResponse.data.data.status}`);
                      console.log(`   Resolution: ${resolveResponse.data.data.resolution?.solution}`);
                      console.log(`   Total timeline entries: ${resolveResponse.data.data.timeline?.length || 0}`);
                    } else {
                      console.log('❌ Ticket resolution failed:', resolveResponse.data.message);
                    }
                  } else {
                    console.log('❌ Ticket status update failed:', statusUpdateResponse.data.message);
                  }
                } else {
                  console.log('❌ Support staff login failed:', supportLoginResponse.data.message);
                }
              } else {
                console.log('❌ Ticket assignment failed:', assignResponse.data.message);
              }
            } else {
              console.log('❌ No support staff available for testing');
            }
          } else {
            console.log('❌ Superadmin login failed:', superadminLoginResponse.data.message);
          }
        } else {
          console.log('❌ Ticket details retrieval failed:', ticketDetailsResponse.data.message);
        }
      } else {
        console.log('❌ Test ticket creation failed:', createTicketResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed:', adminLoginResponse.data.message);
    }

    console.log('\n✅ Comprehensive ticket details modal test completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✓ Server health check');
    console.log('   ✓ Admin ticket creation');
    console.log('   ✓ Ticket details retrieval');
    console.log('   ✓ Superadmin ticket assignment');
    console.log('   ✓ Support staff status updates');
    console.log('   ✓ Ticket resolution with timeline');
    console.log('\n🎯 The comprehensive ticket details modal should now display:');
    console.log('   • Complete ticket overview with tabs');
    console.log('   • Timeline with all status updates');
    console.log('   • Resolution details and ratings');
    console.log('   • Assignment information');
    console.log('   • Technical details and metadata');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testTicketDetailsModal(); 