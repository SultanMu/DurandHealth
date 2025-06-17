// Simple API middleware for Vite development server
const users = [
  { id: 1, username: 'patient1', password: 'password123', email: 'patient1@example.com', firstName: 'John', lastName: 'Doe', role: 'patient' },
  { id: 2, username: 'hr1', password: 'password123', email: 'hr1@example.com', firstName: 'Jane', lastName: 'Smith', role: 'hr' },
  { id: 3, username: 'corporate1', password: 'password123', email: 'corporate1@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'corporate' },
  { id: 4, username: 'admin1', password: 'password123', email: 'admin1@example.com', firstName: 'Alice', lastName: 'Wilson', role: 'admin' }
];

const activeSessions = new Map();

function generateToken(user) {
  const token = `token_${user.id}_${Date.now()}`;
  activeSessions.set(token, user);
  return token;
}

function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  return token ? activeSessions.get(token) : null;
}

export default function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        
        // Parse JSON body
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = {};
            }
            handleRequest(req, res);
          });
        } else {
          handleRequest(req, res);
        }
      });
      
      function handleRequest(req, res) {
        // Login endpoint
        if ((req.url === '/login/' || req.url === '/login') && req.method === 'POST') {
          const { username, password } = req.body;
          const user = users.find(u => u.username === username && u.password === password);
          
          if (!user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
            return;
          }
          
          const token = generateToken(user);
          const { password: _, ...userWithoutPassword } = user;
          
          res.end(JSON.stringify({
            user: userWithoutPassword,
            access: token,
            refresh: token
          }));
          return;
        }
        
        // Register endpoint
        if ((req.url === '/register/' || req.url === '/register') && req.method === 'POST') {
          const { username, password, email, firstName, lastName, role = 'patient' } = req.body;
          
          if (users.find(u => u.username === username || u.email === email)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'User already exists' }));
            return;
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
          
          res.statusCode = 201;
          res.end(JSON.stringify({
            user: userWithoutPassword,
            access: token,
            refresh: token
          }));
          return;
        }
        
        // Current user endpoint
        if ((req.url === '/user/' || req.url === '/user') && req.method === 'GET') {
          const user = authenticateToken(req);
          if (!user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ detail: 'Not authenticated' }));
            return;
          }
          
          const { password: _, ...userWithoutPassword } = user;
          res.end(JSON.stringify(userWithoutPassword));
          return;
        }
        
        // Logout endpoint
        if (req.url === '/api/logout/' && req.method === 'POST') {
          const authHeader = req.headers['authorization'];
          const token = authHeader && authHeader.split(' ')[1];
          
          if (token) {
            activeSessions.delete(token);
          }
          
          res.end(JSON.stringify({ message: 'Logged out successfully' }));
          return;
        }
        
        // Mock endpoints for authenticated users
        const user = authenticateToken(req);
        if (!user && req.url.startsWith('/api/')) {
          res.statusCode = 401;
          res.end(JSON.stringify({ detail: 'Not authenticated' }));
          return;
        }
        
        // Health endpoints
        if (req.url === '/api/health-assessments/' && req.method === 'GET') {
          res.end(JSON.stringify([]));
          return;
        }
        
        if (req.url === '/api/appointments/' && req.method === 'GET') {
          res.end(JSON.stringify([]));
          return;
        }
        
        if (req.url === '/api/health-goals/' && req.method === 'GET') {
          res.end(JSON.stringify([]));
          return;
        }
        
        if (req.url === '/api/corporate/metrics/' && req.method === 'GET') {
          if (!['hr', 'corporate', 'admin'].includes(user.role)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
          }
          
          res.end(JSON.stringify({
            totalEmployees: 1250,
            activeUsers: 890,
            completedAssessments: 650,
            avgHealthScore: 7.8,
            riskDistribution: {
              low: 45,
              medium: 35,
              high: 20
            }
          }));
          return;
        }
        
        // 404 for unhandled API routes
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    }
  };
}