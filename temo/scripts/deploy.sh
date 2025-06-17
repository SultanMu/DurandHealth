#!/bin/bash

# DurandHealth production deployment script
set -e

echo "Starting DurandHealth production deployment..."

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found. Please create it from .env.production template."
    exit 1
fi

# Copy production environment
cp .env.production .env

# Check required environment variables
if [ -z "$SECRET_KEY" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Error: Required environment variables not set. Please check .env.production file."
    echo "Required: SECRET_KEY, DB_PASSWORD"
    exit 1
fi

echo "Building production containers..."
docker-compose -f docker-compose.prod.yml build

echo "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database
echo "Waiting for database to be ready..."
sleep 15

# Run migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser if it doesn't exist
echo "Setting up admin user..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@durandhealth.com', 'admin123')
    print('Admin user created')
else:
    print('Admin user already exists')
"

# Collect static files
echo "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

echo "Production deployment complete!"
echo ""
echo "Services running:"
echo "  Application: http://localhost"
echo "  API: http://localhost/api/"
echo "  Admin: http://localhost/admin/"
echo ""
echo "Admin credentials: admin / admin123"
echo ""
echo "To stop: docker-compose -f docker-compose.prod.yml down"