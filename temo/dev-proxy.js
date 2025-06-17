const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

// Sample users for authentication
const users = [
  { id: 1, username: 'patient1', password: 'password123', email: 'patient1@example.com', firstName: 'John', lastName: 'Doe', role: 'patient' },
  { id: 2, username: 'hr1', password: 'password123', email: 'hr1@example.com', firstName: 'Jane', lastName: 'Smith', role: 'hr' },
  { id: 3, username: 'corporate1', password: 'password123', email: 'corporate1@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'corporate' },
  { id: 4, username: 'admin1', password: 'password123', email: 'admin1@example.com', firstName: 'Alice', lastName: 'Wilson', role: 'admin' }
];

// Simple token storage
const activeSessions = new Map();

// Generate simple token
function generateToken(user) {
  const token = `token_${user.id}_${Date.now()}`;
  activeSessions.set(token, user);
  return token;
}

// Middleware to check authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const user = activeSessions.get(token);
  if (!user) {
    return res.status(401).json({ detail: 'Invalid token' });
  }

  req.user = user;
  next();
}

// Parse JSON bodies
app.use(express.json());

// Authentication endpoints
app.post('/api/login/', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    access: token,
    refresh: token
  });
});

app.post('/api/register/', (req, res) => {
  const { username, password, email, firstName, lastName, role = 'patient' } = req.body;
  
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    firstName,
    lastName,
    role
  };

  users.push(newUser);
  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    user: userWithoutPassword,
    access: token,
    refresh: token
  });
});

app.get('/api/user/', authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

app.post('/api/logout/', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    activeSessions.delete(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

// Health endpoints (mock data)
app.get('/api/health-assessments/', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/appointments/', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/health-goals/', authenticateToken, (req, res) => {
  res.json([]);
});

app.get('/api/corporate/metrics/', authenticateToken, (req, res) => {
  if (!['hr', 'corporate', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json({
    totalEmployees: 1250,
    activeUsers: 890,
    completedAssessments: 650,
    avgHealthScore: 7.8,
    riskDistribution: {
      low: 45,
      medium: 35,
      high: 20
    }
  });
});

// Serve static files and proxy to frontend
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on port ${PORT}`);
  console.log(`API endpoints available at /api/*`);
  console.log(`Frontend proxied from localhost:5000`);
});