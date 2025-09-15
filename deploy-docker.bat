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
    echo.
    pause
)

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
    echo    - Fashion CMS: http://localhost:3000
    echo    - phpMyAdmin: http://localhost:8080
    echo.
    echo 📊 Database Connection:
    echo    - Host: localhost
    echo    - Port: 3306
    echo    - Database: fashion_cms
    echo    - Username: fashionuser
    echo    - Password: (check .env file)
    echo.
    echo 🔍 To view logs: docker-compose logs -f
    echo 🛑 To stop: docker-compose down
    pause
)