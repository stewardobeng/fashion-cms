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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and update the secret keys before continuing!"
    echo "   - JWT_SECRET"
    echo "   - NEXTAUTH_SECRET"
    echo "   - Database passwords"
    echo ""
    read -p "Press Enter after updating the .env file..."
fi

echo "🔧 Building Docker images..."
docker-compose build

echo "🚀 Starting Fashion CMS..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Fashion CMS is running!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   - Fashion CMS: http://localhost:3000"
    echo "   - phpMyAdmin: http://localhost:8080"
    echo ""
    echo "📊 Database Connection:"
    echo "   - Host: localhost"
    echo "   - Port: 3306"
    echo "   - Database: fashion_cms"
    echo "   - Username: fashionuser"
    echo "   - Password: (check .env file)"
    echo ""
    echo "🔍 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi