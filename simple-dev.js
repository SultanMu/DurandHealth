const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Starting DurandHealth development server...');
  
  // Change to frontend directory and start Vite
  process.chdir('frontend');
  
  // Start Vite dev server
  execSync('npx vite --host 0.0.0.0 --port 5000', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
} catch (error) {
  console.error('Error starting development server:', error.message);
  process.exit(1);
}