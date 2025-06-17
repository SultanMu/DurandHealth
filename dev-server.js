#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure frontend dependencies are available
const frontendDir = path.join(__dirname, 'frontend');
const nodeModulesExists = fs.existsSync(path.join(frontendDir, 'node_modules'));

function startViteServer() {
  console.log('🚀 Starting DurandHealth development server...');
  
  const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  vite.on('error', (err) => {
    console.error('❌ Failed to start Vite:', err);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    vite.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    vite.kill('SIGTERM');
    process.exit(0);
  });
}

if (!nodeModulesExists) {
  console.log('📦 Installing frontend dependencies...');
  const install = spawn('npm', ['install'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  install.on('close', (code) => {
    if (code === 0) {
      startViteServer();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startViteServer();
}