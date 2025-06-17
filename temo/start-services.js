const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting DurandHealth Development Services...');

// Start Django backend
console.log('📱 Starting Django backend on port 8000...');
const backend = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8000'], {
  cwd: path.join(process.cwd(), 'backend'),
  stdio: 'inherit',
  env: { ...process.env }
});

// Start frontend after backend initializes
setTimeout(() => {
  console.log('🌐 Starting React frontend on port 5000...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
    stdio: 'inherit',
    env: { ...process.env }
  });

  frontend.on('exit', (code) => {
    console.log(`Frontend exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 3000);

backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down services...');
  backend.kill();
  process.exit(0);
});