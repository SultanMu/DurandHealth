# DurandHealth Deployment Guide

## Overview

DurandHealth is a containerized healthcare management system with separate Docker containers for:
- **Frontend**: React.js with Vite (Port 3000)
- **Backend**: Django REST API (Port 8000) 
- **Database**: PostgreSQL (Port 5432)
- **Proxy**: Nginx load balancer (Production only)

## Quick Start (Development)

### 1. Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone and Setup
```bash
git clone <repository-url>
cd durandhealth
cp .env.example .env
```

### 3. Start Development Environment
```bash
# Quick start script
./scripts/start.sh

# Or manual start
docker-compose up -d
./scripts/migrate.sh
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## Production Deployment

### 1. Server Requirements
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### 2. Environment Configuration
```bash
# Copy production template
cp .env.production .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# Security
SECRET_KEY=your_50_character_secret_key_here
DB_PASSWORD=secure_database_password_123

# Domain configuration
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://yourdomain.com/api

# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/durandhealth
```

### 3. SSL/TLS Setup (Recommended)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate Let's Encrypt certificate
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### 4. Production Deployment
```bash
# Deploy production stack
./scripts/deploy.sh

# Or manual deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Post-Deployment Setup
```bash
# Create admin user
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Verify services
docker-compose -f docker-compose.prod.yml ps
curl -f http://localhost/health
```

## Database Management

### Backup and Restore
```bash
# Create backup
./scripts/backup.sh

# Manual backup
docker-compose exec postgres pg_dump -U postgres durandhealth > backup.sql

# Restore from backup
docker-compose exec postgres psql -U postgres durandhealth < backup.sql
```

### Migrations
```bash
# Development
./scripts/migrate.sh

# Production
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## Monitoring and Maintenance

### Health Checks
```bash
# Service status
docker-compose ps

# Service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Resource usage
docker stats
```

### Log Management
```bash
# View application logs
docker-compose logs backend --tail 100

# Clear logs
docker-compose logs --no-log-prefix > /dev/null 2>&1
```

### Security Updates
```bash
# Update container images
docker-compose pull
docker-compose up -d

# System updates
sudo apt update && sudo apt upgrade -y
```

## Scaling and Performance

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    
  frontend:
    deploy:
      replicas: 2
```

### Database Optimization
```sql
-- Performance monitoring
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_user_tables;

-- Index optimization
CREATE INDEX CONCURRENTLY idx_user_role ON healthcare_user(role);
CREATE INDEX CONCURRENTLY idx_assessment_created ON healthcare_healthassessment(created_at);
```

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d
./scripts/migrate.sh
```

**2. Frontend Build Errors**
```bash
# Clear node modules
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose restart frontend
```

**3. Backend 500 Errors**
```bash
# Check Django logs
docker-compose logs backend --tail 50

# Run Django checks
docker-compose exec backend python manage.py check --deploy
```

**4. SSL Certificate Issues**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

### Performance Issues
```bash
# Monitor resource usage
htop
docker stats

# Database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Clear Docker system
docker system prune -af
```

## Security Checklist

### Pre-Production
- [ ] Change default SECRET_KEY
- [ ] Set secure database passwords
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS/SSL
- [ ] Set DEBUG=False
- [ ] Configure firewall rules
- [ ] Enable audit logging

### Post-Production
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor access logs
- [ ] Review user permissions
- [ ] Update SSL certificates

## Support and Documentation

### Test Accounts (Development)
| Role | Username | Password |
|------|----------|----------|
| Patient | patient1 | password123 |
| HR | hr1 | password123 |
| Corporate | corporate1 | password123 |
| Admin | admin1 | password123 |

### API Documentation
- Base URL: `/api/`
- Authentication: Session-based
- Documentation: `/api/docs/` (when enabled)

### Contact
For technical support:
1. Check troubleshooting guide
2. Review application logs
3. Create GitHub issue with logs and environment details