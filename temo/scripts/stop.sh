#!/bin/bash

# DurandHealth stop script
set -e

echo "Stopping DurandHealth services..."

# Stop all services
docker-compose down

# Optional: Remove volumes (uncomment if you want to reset data)
# echo "Removing volumes..."
# docker-compose down -v

echo "All services stopped successfully."
echo ""
echo "To start again: ./scripts/start.sh"
echo "To remove all data: docker-compose down -v"