const { spawn } = require('child_process');
const path = require('path');

console.log('Starting DurandHealth Development Environment...');

// Start Django backend
const backend = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8000'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

// Start frontend after a short delay
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.on('exit', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 3000);

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down development servers...');
  backend.kill();
  process.exit(0);
});