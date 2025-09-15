@echo off
REM Fashion CMS Docker Deployment Script for Windows
REM This script sets up and deploys the Fashion CMS application using Docker

echo 🎭 Fashion CMS Docker Deployment Script
echo ======================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed (support both v1 and v2)
docker-compose --version >nul 2>&1
if not errorlevel 1 (
    set DOCKER_COMPOSE_CMD=docker-compose
    echo ✅ Docker Compose v1 is installed
) else (
    docker compose version >nul 2>&1
    if not errorlevel 1 (
        set DOCKER_COMPOSE_CMD=docker compose
        echo ✅ Docker Compose v2 is installed
    ) else (
        echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
        echo Visit: https://docs.docker.com/desktop/windows/install/
        pause
        exit /b 1
    )
)

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating environment configuration...
    
    REM Check if .env.docker exists, if not create it
    if not exist ".env.docker" (
        echo ⚠️  .env.docker template not found. Creating default environment file...
        (
            echo # Port Configuration (change these if ports are not available)
            echo APP_PORT=3000
            echo DB_PORT=3306
            echo PHPMYADMIN_PORT=8080
            echo.
            echo # MySQL Database Configuration
            echo MYSQL_ROOT_PASSWORD=fashioncms2024
            echo MYSQL_DATABASE=fashion_cms
            echo MYSQL_USER=fashionuser
            echo MYSQL_PASSWORD=fashionpass2024
            echo.
            echo # Application Database URL
            echo DATABASE_URL=mysql://fashionuser:fashionpass2024@mysql:3306/fashion_cms
            echo.
            echo # JWT Authentication Secret (CHANGE THIS IN PRODUCTION!)
            echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
            echo.
            echo # NextAuth Configuration
            echo NEXTAUTH_URL=http://localhost:3000
            echo NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
            echo.
            echo # Application Environment
            echo NODE_ENV=production
        ) > .env.docker
        echo ✅ Created default .env.docker file
    )
    
    copy .env.docker .env
    echo ⚠️  Please edit .env file and update the secret keys before continuing!
    echo    - JWT_SECRET
    echo    - NEXTAUTH_SECRET
    echo    - Database passwords
    echo    - Port numbers (if defaults are in use)
    echo.
    echo 💡 You can also run 'configure-ports.bat' to check and configure ports interactively
    echo.
    pause
)

REM Load some environment variables for display
set APP_PORT=3000
set DB_PORT=3306
set PHPMYADMIN_PORT=8080

if defined APP_PORT_ENV set APP_PORT=%APP_PORT_ENV%
if defined DB_PORT_ENV set DB_PORT=%DB_PORT_ENV%
if defined PHPMYADMIN_PORT_ENV set PHPMYADMIN_PORT=%PHPMYADMIN_PORT_ENV%

echo 🔧 Building Docker images...
%DOCKER_COMPOSE_CMD% build

echo 🚀 Starting Fashion CMS...
%DOCKER_COMPOSE_CMD% up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
%DOCKER_COMPOSE_CMD% ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Failed to start services. Check logs with: %DOCKER_COMPOSE_CMD% logs
    pause
    exit /b 1
) else (
    echo ✅ Fashion CMS is running!
    echo.
    echo 🌐 Application URLs:
    echo    - Fashion CMS: http://localhost:%APP_PORT%
    echo    - phpMyAdmin: http://localhost:%PHPMYADMIN_PORT%
    echo.
    echo 📊 Database Connection:
    echo    - Host: localhost
    echo    - Port: %DB_PORT%
    echo    - Database: fashion_cms
    echo    - Username: fashionuser
    echo    - Password: (check .env file)
    echo.
    echo 🔍 To view logs: %DOCKER_COMPOSE_CMD% logs -f
    echo 🛑 To stop: %DOCKER_COMPOSE_CMD% down
    pause
)