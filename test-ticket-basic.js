const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Simple test function
async function testBasicTicketSystem() {
  console.log('🚀 Testing Basic Ticket System...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or health endpoint not available');
      return;
    }

    // Test 2: Test authentication
    console.log('\n2. Testing authentication...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'Admin@123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Authentication successful');
        const token = loginResponse.data.data.tokens.accessToken;
        
        // Test 3: Test ticket creation
        console.log('\n3. Testing ticket creation...');
        try {
          const ticketData = {
            title: 'Test Ticket',
            description: 'This is a test ticket',
            category: 'maintenance',
            priority: 'medium',
            location: {
              room: '101',
              floor: '1'
            },
            contactPhone: '9876543210'
          };

          const createResponse = await axios.post(`${API_BASE_URL}/tickets`, ticketData, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (createResponse.data.success) {
            console.log('✅ Ticket creation successful');
            console.log('   Ticket ID:', createResponse.data.data._id);
            console.log('   Title:', createResponse.data.data.title);
            console.log('   Status:', createResponse.data.data.status);
            
            const ticketId = createResponse.data.data._id;
            
            // Test 4: Test ticket retrieval
            console.log('\n4. Testing ticket retrieval...');
            try {
              const getResponse = await axios.get(`${API_BASE_URL}/tickets`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (getResponse.data.success) {
                console.log('✅ Ticket retrieval successful');
                console.log('   Tickets found:', getResponse.data.data.length);
              } else {
                console.log('❌ Ticket retrieval failed');
              }
            } catch (error) {
              console.log('❌ Ticket retrieval error:', error.response?.data?.message || error.message);
            }

            // Test 5: Test ticket statistics
            console.log('\n5. Testing ticket statistics...');
            try {
              const statsResponse = await axios.get(`${API_BASE_URL}/tickets/stats`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (statsResponse.data.success) {
                console.log('✅ Ticket statistics successful');
                console.log('   Total tickets:', statsResponse.data.data.total);
              } else {
                console.log('❌ Ticket statistics failed');
              }
            } catch (error) {
              console.log('❌ Ticket statistics error:', error.response?.data?.message || error.message);
            }

          } else {
            console.log('❌ Ticket creation failed:', createResponse.data.message);
          }
        } catch (error) {
          console.log('❌ Ticket creation error:', error.response?.data?.message || error.message);
        }
        
      } else {
        console.log('❌ Authentication failed:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.response?.data?.message || error.message);
    }

    // Test 6: Test ticket options
    console.log('\n6. Testing ticket options...');
    try {
      const optionsResponse = await axios.get(`${API_BASE_URL}/tickets/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (optionsResponse.data.success) {
        console.log('✅ Ticket options successful');
        console.log('   Categories:', optionsResponse.data.data.map(c => c.label).join(', '));
      } else {
        console.log('❌ Ticket options failed');
      }
    } catch (error) {
      console.log('❌ Ticket options error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n✅ Basic ticket system test completed!');
}

// Run the test
testBasicTicketSystem(); 