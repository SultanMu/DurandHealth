const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Proxy API requests to Django backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000
}));

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});