const { exec } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

// Start the server
const serverProcess = exec('node server.js', {
  cwd: path.resolve(__dirname)
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

// Handle server exit
serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill();
  process.exit();
}); 