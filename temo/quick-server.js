const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'frontend', 'simple-index.html');
  
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`DurandHealth server running at http://0.0.0.0:${PORT}`);
  console.log('✓ Application is ready for testing');
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    process.exit(0);
  });
});