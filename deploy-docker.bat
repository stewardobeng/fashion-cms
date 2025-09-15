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

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating environment configuration...
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
docker-compose build

echo 🚀 Starting Fashion CMS...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Failed to start services. Check logs with: docker-compose logs
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
    echo 🔍 To view logs: docker-compose logs -f
    echo 🛑 To stop: docker-compose down
    pause
)