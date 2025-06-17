const fs = require('fs');
const path = require('path');

// Read current package.json
const packagePath = './package.json';
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Temporarily add dev script
packageData.scripts.dev = "cd frontend && npm install && npx vite --host 0.0.0.0 --port 5000";

// Write modified package.json
fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

// Start the dev server
const { spawn } = require('child_process');
const devProcess = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit',
  shell: true 
});

// Cleanup function
function cleanup() {
  // Restore original package.json
  delete packageData.scripts.dev;
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
}

devProcess.on('close', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});