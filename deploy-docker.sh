#!/bin/bash

# Fashion CMS Docker Deployment Script
# This script sets up and deploys the Fashion CMS application using Docker

set -e

echo "🎭 Fashion CMS Docker Deployment Script"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed (support both v1 and v2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo "✅ Docker Compose v1 is installed"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo "✅ Docker Compose v2 is installed"
else
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and update the secret keys before continuing!"
    echo "   - JWT_SECRET"
    echo "   - NEXTAUTH_SECRET"
    echo "   - Database passwords"
    echo "   - Port numbers (if defaults are in use)"
    echo ""
    echo "💡 You can also run './configure-ports.sh' to check and configure ports interactively"
    echo ""
    read -p "Press Enter after updating the .env file..."
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -E '^[A-Z_]+=.*' | xargs)
fi

APP_PORT=${APP_PORT:-3000}
PHPMYADMIN_PORT=${PHPMYADMIN_PORT:-8080}

echo "🔧 Building Docker images..."
$DOCKER_COMPOSE_CMD build

echo "🚀 Starting Fashion CMS..."
$DOCKER_COMPOSE_CMD up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    echo "✅ Fashion CMS is running!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   - Fashion CMS: http://localhost:$APP_PORT"
    echo "   - phpMyAdmin: http://localhost:$PHPMYADMIN_PORT"
    echo ""
    echo "📊 Database Connection:"
    echo "   - Host: localhost"
    echo "   - Port: $DB_PORT"
    echo "   - Database: fashion_cms"
    echo "   - Username: fashionuser"
    echo "   - Password: (check .env file)"
    echo ""
    echo "🔍 To view logs: $DOCKER_COMPOSE_CMD logs -f"
    echo "🛑 To stop: $DOCKER_COMPOSE_CMD down"
else
    echo "❌ Failed to start services. Check logs with: $DOCKER_COMPOSE_CMD logs"
    exit 1
fi