@echo off
REM Fashion CMS Port Configuration Helper for Windows
REM This script helps you configure custom ports for Docker deployment

echo 🔧 Fashion CMS Port Configuration
echo =================================

REM Function to check if port is available
set APP_PORT=3000
set DB_PORT=3306
set PHPMYADMIN_PORT=8080

if defined APP_PORT_ENV set APP_PORT=%APP_PORT_ENV%
if defined DB_PORT_ENV set DB_PORT=%DB_PORT_ENV%
if defined PHPMYADMIN_PORT_ENV set PHPMYADMIN_PORT=%PHPMYADMIN_PORT_ENV%

echo.
echo Checking default ports...

REM Check app port
netstat -an | findstr :%APP_PORT% >nul
if errorlevel 1 (
    echo ✅ Port %APP_PORT% is available (Fashion CMS App)
) else (
    echo ⚠️  Port %APP_PORT% is already in use (Fashion CMS App)
    echo 💡 Try using port 8000, 8001, or 8080 instead
)

REM Check database port
netstat -an | findstr :%DB_PORT% >nul
if errorlevel 1 (
    echo ✅ Port %DB_PORT% is available (MySQL Database)
) else (
    echo ⚠️  Port %DB_PORT% is already in use (MySQL Database)
    echo 💡 Try using port 3307, 3308, or 3309 instead
)

echo.
echo 📝 To change ports, edit your .env file:
echo    APP_PORT=8000           # Change app port to 8000
echo    DB_PORT=3307            # Change database port to 3307
echo.
echo Or set environment variables before running docker-compose:
echo    set APP_PORT=8000
echo    set DB_PORT=3307
echo    docker compose up -d
echo.

REM Interactive configuration
set /p configure_interactive="Would you like to configure ports interactively? (y/n): "

if /i "%configure_interactive%"=="y" (
    echo.
    echo 🔧 Interactive Port Configuration
    echo ================================
    
    REM App port
    set /p new_app_port="Enter port for Fashion CMS App (current: %APP_PORT%): "
    if "%new_app_port%"=="" set new_app_port=%APP_PORT%
    
    REM DB port
    set /p new_db_port="Enter port for MySQL Database (current: %DB_PORT%): "
    if "%new_db_port%"=="" set new_db_port=%DB_PORT%
    
    echo.
    echo 📄 Creating .env file with new ports...
    
    REM Create or copy .env file
    if not exist ".env" copy .env.docker .env
    
    echo APP_PORT=%new_app_port% >> .env.temp
    echo DB_PORT=%new_db_port% >> .env.temp
    
    REM Update .env file (basic approach for Windows)
    powershell -Command "(Get-Content .env) -replace '^APP_PORT=.*', 'APP_PORT=%new_app_port%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace '^DB_PORT=.*', 'DB_PORT=%new_db_port%' | Set-Content .env"
    
    del .env.temp 2>nul
    
    echo ✅ Configuration updated!
    echo.
    echo 🚀 New access URLs will be:
    echo    - Fashion CMS: http://localhost:%new_app_port%
    echo    - MySQL: localhost:%new_db_port%
    echo.
    echo Run 'docker compose up -d' to apply changes.
)

pause