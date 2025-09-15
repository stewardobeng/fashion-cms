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
    
    # Check if .env.docker exists, if not create it
    if [ ! -f ".env.docker" ]; then
        echo "⚠️  .env.docker template not found. Creating default environment file..."
        cat > .env.docker << 'EOF'
# Port Configuration (change these if ports are not available)
APP_PORT=3000
DB_PORT=3306

# Alternative port examples (uncomment and modify as needed):
# APP_PORT=8000          # Use port 8000 for the app
# DB_PORT=3307           # Use port 3307 for MySQL

# Docker Environment Configuration for Fashion CMS
# Copy this file to .env.docker and customize the values

# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=fashioncms2024
MYSQL_DATABASE=fashion_cms
MYSQL_USER=fashionuser
MYSQL_PASSWORD=fashionpass2024

# Application Database URL (automatically configured for Docker)
DATABASE_URL=mysql://fashionuser:fashionpass2024@mysql:3306/fashion_cms

# JWT Authentication Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production

# Application Environment
NODE_ENV=production
EOF
        echo "✅ Created default .env.docker file"
    fi
    
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