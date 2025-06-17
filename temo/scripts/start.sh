#!/bin/bash

# DurandHealth startup script
set -e

echo "Starting DurandHealth healthcare management system..."

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating environment file from template..."
    cp .env.example .env
    echo "Please edit .env file with your configuration before running again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Build containers
echo "Building containers..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres; do
    sleep 2
done

# Run migrations
echo "Running database migrations..."
docker-compose exec backend python manage.py migrate

# Collect static files
echo "Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Check if services are healthy
echo "Checking service health..."
sleep 10

# Display status
echo "Service status:"
docker-compose ps

echo ""
echo "DurandHealth is now running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Admin panel: http://localhost:8000/admin"
echo ""
echo "Test accounts:"
echo "  Patient: patient1 / password123"
echo "  HR: hr1 / password123"
echo "  Corporate: corporate1 / password123"
echo "  Admin: admin1 / password123"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"