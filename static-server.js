const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve the static HTML file for all requests
  const filePath = path.join(__dirname, 'frontend', 'public', 'index.html');
  
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(content);
  });
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`DurandHealth server running at http://0.0.0.0:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
});