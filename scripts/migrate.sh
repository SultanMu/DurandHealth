#!/bin/bash

# Migration script for DurandHealth application
set -e

echo "Starting database migrations..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres; do
  sleep 1
done

echo "Database is ready. Running Django migrations..."

# Run Django migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create superuser if needed
echo "Creating Django superuser..."
docker-compose exec backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
from healthcare.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@durandhealth.com',
        password='admin123',
        firstName='System',
        lastName='Admin',
        role='admin'
    )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo "Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

echo "Database migrations completed successfully!"