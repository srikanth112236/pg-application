const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
  console.log('🚀 Quick Ticket System Test...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running');

    // Test ticket categories endpoint
    console.log('\n2. Testing ticket categories...');
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/tickets/categories`);
      console.log('✅ Ticket categories endpoint working');
      console.log('   Categories:', categoriesResponse.data.data.map(c => c.label).join(', '));
    } catch (error) {
      console.log('❌ Ticket categories failed:', error.response?.data?.message || error.message);
    }

    // Test ticket priorities endpoint
    console.log('\n3. Testing ticket priorities...');
    try {
      const prioritiesResponse = await axios.get(`${API_BASE_URL}/tickets/priorities`);
      console.log('✅ Ticket priorities endpoint working');
      console.log('   Priorities:', prioritiesResponse.data.data.map(p => p.label).join(', '));
    } catch (error) {
      console.log('❌ Ticket priorities failed:', error.response?.data?.message || error.message);
    }

    // Test ticket statuses endpoint
    console.log('\n4. Testing ticket statuses...');
    try {
      const statusesResponse = await axios.get(`${API_BASE_URL}/tickets/statuses`);
      console.log('✅ Ticket statuses endpoint working');
      console.log('   Statuses:', statusesResponse.data.data.map(s => s.label).join(', '));
    } catch (error) {
      console.log('❌ Ticket statuses failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Quick test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest(); 