const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Backend Startup...\n');

// Set environment variables
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://localhost:27017/pg_maintenance';
process.env.JWT_SECRET = 'dev-secret-key';
process.env.JWT_REFRESH_SECRET = 'dev-refresh-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Start the backend server
const backendProcess = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  env: process.env
});

let output = '';
let errorOutput = '';

backendProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('✅ Backend Output:', data.toString());
});

backendProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('❌ Backend Error:', data.toString());
});

backendProcess.on('close', (code) => {
  console.log(`\n🔍 Backend process exited with code ${code}`);
  
  if (code === 0) {
    console.log('✅ Backend started successfully!');
  } else {
    console.log('❌ Backend failed to start');
    console.log('Error output:', errorOutput);
  }
});

// Kill the process after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Stopping backend test...');
  backendProcess.kill();
}, 10000); 