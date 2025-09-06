const { spawn } = require('child_process');
const fetch = require('node-fetch');

console.log('🔧 Backend Server Restart and Dashboard Verification\n');

console.log('📋 Instructions:');
console.log('1. Please stop your current backend server (Ctrl+C)');
console.log('2. Then run this script to restart and verify:');
console.log('   node restart-backend.js');
console.log('');

console.log('🚀 Starting backend server...');

// Start the backend server
const backendProcess = spawn('npm', ['start'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true
});

// Wait a few seconds for the server to start
setTimeout(async () => {
  console.log('\n⏳ Waiting for server to start...');
  
  try {
    // Test server health
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
      
      // Test dashboard routes
      const testResponse = await fetch('http://localhost:5000/api/dashboard/test');
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ Dashboard routes are working!');
        console.log('📊 Test response:', testData.message);
        console.log('\n🎉 Dashboard is now working!');
        console.log('💡 You can now access the dashboard in your frontend');
      } else {
        console.log('❌ Dashboard routes are not working');
        console.log('📊 Status:', testResponse.status);
        const errorText = await testResponse.text();
        console.log('📊 Error:', errorText);
      }
    } else {
      console.log('❌ Server is not responding properly');
    }
  } catch (error) {
    console.log('❌ Error testing server:', error.message);
  }
}, 5000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping backend server...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});

backendProcess.on('close', (code) => {
  console.log(`\n📊 Backend server exited with code ${code}`);
}); 