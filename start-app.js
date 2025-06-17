const { spawn } = require('child_process');
const path = require('path');

// Start Django backend
const django = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8000'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Start React frontend
const react = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  django.kill();
  react.kill();
  process.exit();
});

console.log('Starting Django backend on port 8000...');
console.log('Starting React frontend on port 5000...');