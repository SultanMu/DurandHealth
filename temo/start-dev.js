const fs = require('fs');
const path = require('path');

// Create a temporary package.json with dev script
const packagePath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add dev script temporarily
packageData.scripts.dev = "node scripts/dev.js";

fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

console.log('Added dev script to package.json');

// Now run the dev script
const { spawn } = require('child_process');
const devProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

devProcess.on('close', (code) => {
  // Restore original package.json
  delete packageData.scripts.dev;
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
  process.exit(code);
});