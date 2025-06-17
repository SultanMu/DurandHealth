# DurandHealth - Healthcare Management System

A comprehensive healthcare management platform built with React frontend, Django backend, and PostgreSQL database. Features containerized deployment, role-based access control, and advanced patient engagement tools.

## 🏥 Features

### Patient Portal
- Interactive health dashboards with micro-animations
- Health assessment forms and tracking
- Appointment booking and management
- AI-powered care plan recommendations
- Health reminders and notifications
- Virtual assistant integration

### Corporate Dashboard
- Employee health analytics
- Wellness program management
- Compliance reporting
- Incentive program tracking
- Bulk data management

### Administrative Features
- Multi-role authentication (Patient, HR, Corporate, Admin)
- Consent management system
- Audit logging and compliance
- Data export and reporting
- User management interface

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Lucide React** for icons

### Backend
- **Django 5.2** with Django REST Framework
- **PostgreSQL** database
- **JWT** authentication
- **Django CORS** for cross-origin requests
- **Pillow** for image processing

### DevOps & Deployment
- **Docker** containerization
- **Docker Compose** for local development
- **Nginx** reverse proxy configuration
- Production-ready Dockerfiles

## 🏗️ Architecture

```
DurandHealth/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── Dockerfile
├── backend/               # Django application
│   ├── healthcare/        # Main Django app
│   │   ├── models.py      # Database models
│   │   ├── views.py       # API endpoints
│   │   ├── serializers.py # Data serialization
│   │   └── admin.py       # Admin interface
│   └── Dockerfile
├── shared/                # Shared types and schemas
├── nginx/                 # Nginx configuration
└── docker-compose.yml     # Container orchestration
```

## 🚦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd durandhealth

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
```

### Local Development
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Set up environment variables
cp .env.example .env.development

# Run database migrations
cd backend && python manage.py migrate

# Start development servers
npm run dev  # Frontend (port 5000)
python manage.py runserver  # Backend (port 8000)
```

## 🔐 Authentication

The system supports multiple user roles with different access levels:

### Demo Credentials
- **Patient**: `patient1` / `password123`
- **HR**: `hr1` / `password123`
- **Corporate**: `corporate1` / `password123`
- **Admin**: `admin1` / `password123`

### Role Permissions
- **Patient**: Personal health data, appointments, assessments
- **HR**: Employee wellness programs, basic reporting
- **Corporate**: Advanced analytics, compliance reports, bulk operations
- **Admin**: Full system access, user management, system configuration

## 🗄️ Database Schema

### Core Models
- **User**: Extended Django user with role-based access
- **HealthAssessment**: Comprehensive health evaluations
- **Appointment**: Medical appointment scheduling
- **Consent**: GDPR-compliant consent management
- **HealthGoal**: Patient wellness objectives
- **HealthActivity**: Daily health tracking
- **IncentiveProgram**: Corporate wellness incentives
- **Report**: Analytics and compliance reporting
- **AuditLog**: Complete system audit trail

## 🎨 UI/UX Features

### Micro-Interactions
- Smooth hover animations on dashboard elements
- Progressive loading states
- Interactive progress bars
- Responsive card transitions
- Gradient background effects

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized layouts
- Accessible navigation patterns
- High contrast mode support

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Docker Configuration
- Multi-stage builds for optimized images
- Health checks for all services
- Volume mounts for persistent data
- Environment-based configuration

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh

### Healthcare Endpoints
- `GET /api/health-assessments/` - List assessments
- `POST /api/health-assessments/` - Create assessment
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Book appointment
- `GET /api/health-goals/` - List health goals
- `POST /api/health-goals/` - Create health goal

### Admin Endpoints
- `GET /api/users/` - User management
- `GET /api/reports/` - Generate reports
- `GET /api/audit-logs/` - System audit logs

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && python manage.py test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Environment Setup
1. Configure environment variables for production
2. Set up SSL certificates for HTTPS
3. Configure database backups
4. Set up monitoring and logging

## 🔒 Security

### Implemented Security Measures
- JWT token authentication
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure password hashing
- Role-based access control
- Audit logging

### GDPR Compliance
- Consent management system
- Data export functionality
- Right to erasure implementation
- Privacy by design architecture

## 📈 Performance

### Optimization Features
- Code splitting and lazy loading
- Database query optimization
- Caching strategies
- Image optimization
- Minified production builds
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [documentation](docs/)
- Review the [FAQ](docs/FAQ.md)

## 🏆 Acknowledgments

- Built with modern web technologies
- Follows healthcare industry best practices
- Implements accessibility standards
- Designed for scalability and maintainability# DurandHealth
