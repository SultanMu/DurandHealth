#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if frontend dependencies are installed
const frontendPath = path.join(__dirname, 'frontend');
const nodeModulesPath = path.join(frontendPath, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('Installing frontend dependencies...');
  const installProcess = spawn('npm', ['install'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      startVite();
    } else {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startVite();
}

function startVite() {
  console.log('Starting Durand Health frontend development server...');

  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start frontend:', error);
    process.exit(1);
  });

  viteProcess.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nStopping development server...');
    viteProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    viteProcess.kill('SIGTERM');
  });
}