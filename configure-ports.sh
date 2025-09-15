#!/bin/bash

# Fashion CMS Port Configuration Helper
# This script helps you configure custom ports for Docker deployment

echo "🔧 Fashion CMS Port Configuration"
echo "================================="

# Function to check if port is available
check_port() {
    local port=$1
    local service=$2
    
    if nc -z localhost $port 2>/dev/null; then
        echo "⚠️  Port $port is already in use (for $service)"
        return 1
    else
        echo "✅ Port $port is available (for $service)"
        return 0
    fi
}

# Function to suggest alternative port
suggest_port() {
    local base_port=$1
    local service=$2
    
    for i in {1..10}; do
        new_port=$((base_port + i))
        if ! nc -z localhost $new_port 2>/dev/null; then
            echo "💡 Suggested alternative for $service: $new_port"
            return $new_port
        fi
    done
    echo "❌ No available ports found near $base_port"
    return 0
}

echo ""
echo "Checking default ports..."

# Check default ports
APP_PORT=${APP_PORT:-3000}
DB_PORT=${DB_PORT:-3306}
PHPMYADMIN_PORT=${PHPMYADMIN_PORT:-8080}

check_port $APP_PORT "Fashion CMS App" || suggest_port $APP_PORT "Fashion CMS App"
check_port $DB_PORT "MySQL Database" || suggest_port $DB_PORT "MySQL Database"
check_port $PHPMYADMIN_PORT "phpMyAdmin" || suggest_port $PHPMYADMIN_PORT "phpMyAdmin"

echo ""
echo "📝 To change ports, edit your .env file:"
echo "   APP_PORT=8000           # Change app port to 8000"
echo "   DB_PORT=3307            # Change database port to 3307"
echo "   PHPMYADMIN_PORT=8081    # Change phpMyAdmin port to 8081"
echo ""
echo "Or set environment variables:"
echo "   export APP_PORT=8000"
echo "   export DB_PORT=3307"
echo "   export PHPMYADMIN_PORT=8081"
echo "   docker-compose up -d"
echo ""

# Interactive port configuration
read -p "Would you like to configure ports interactively? (y/n): " configure_interactive

if [[ $configure_interactive =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Interactive Port Configuration"
    echo "================================"
    
    # App port
    while true; do
        read -p "Enter port for Fashion CMS App (current: $APP_PORT): " new_app_port
        new_app_port=${new_app_port:-$APP_PORT}
        
        if check_port $new_app_port "Fashion CMS App"; then
            APP_PORT=$new_app_port
            break
        fi
    done
    
    # DB port
    while true; do
        read -p "Enter port for MySQL Database (current: $DB_PORT): " new_db_port
        new_db_port=${new_db_port:-$DB_PORT}
        
        if check_port $new_db_port "MySQL Database"; then
            DB_PORT=$new_db_port
            break
        fi
    done
    
    # phpMyAdmin port
    while true; do
        read -p "Enter port for phpMyAdmin (current: $PHPMYADMIN_PORT): " new_phpmyadmin_port
        new_phpmyadmin_port=${new_phpmyadmin_port:-$PHPMYADMIN_PORT}
        
        if check_port $new_phpmyadmin_port "phpMyAdmin"; then
            PHPMYADMIN_PORT=$new_phpmyadmin_port
            break
        fi
    done
    
    # Update .env file
    echo ""
    echo "📄 Updating .env file with new ports..."
    
    # Create or update .env file
    if [ ! -f ".env" ]; then
        cp .env.docker .env
    fi
    
    # Update ports in .env file
    sed -i "s/^APP_PORT=.*/APP_PORT=$APP_PORT/" .env
    sed -i "s/^DB_PORT=.*/DB_PORT=$DB_PORT/" .env
    sed -i "s/^PHPMYADMIN_PORT=.*/PHPMYADMIN_PORT=$PHPMYADMIN_PORT/" .env
    
    echo "✅ Configuration updated!"
    echo ""
    echo "🚀 New access URLs will be:"
    echo "   - Fashion CMS: http://localhost:$APP_PORT"
    echo "   - phpMyAdmin: http://localhost:$PHPMYADMIN_PORT"
    echo "   - MySQL: localhost:$DB_PORT"
    echo ""
    echo "Run 'docker-compose up -d' to apply changes."
fi