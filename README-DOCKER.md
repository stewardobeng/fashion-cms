# Fashion CMS - Docker Deployment

This document provides quick instructions for deploying Fashion CMS using Docker. For detailed documentation, see [`deployment/DOCKER.md`](deployment/DOCKER.md).

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

### One-Command Deployment

**Linux/macOS:**
```bash
chmod +x deploy-docker.sh && ./deploy-docker.sh
```

**Windows:**
```cmd
deploy-docker.bat
```

### Manual Deployment

```bash
# 1. Copy environment configuration
cp .env.docker .env

# 2. Edit secrets (IMPORTANT!)
nano .env  # Update JWT_SECRET, NEXTAUTH_SECRET, and passwords

# 3. Start services
docker compose up -d

# 4. Check status
docker compose ps
```

## 📍 Access Points

After deployment:
- **Fashion CMS**: http://localhost:3000 (or your custom APP_PORT)
- **phpMyAdmin**: http://localhost:8080 (or your custom PHPMYADMIN_PORT)
- **Health Check**: http://localhost:3000/api/health

### 🔧 Changing Ports

If default ports are in use:

**Quick Configuration:**
```bash
# Linux/macOS
./configure-ports.sh

# Windows
configure-ports.bat
```

**Manual Configuration:**
Edit `.env` file:
```bash
APP_PORT=8000           # Change app port
DB_PORT=3307            # Change database port
PHPMYADMIN_PORT=8081    # Change phpMyAdmin port
```

## 🔧 Management

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Update application
docker compose down && docker compose build --no-cache && docker compose up -d
```

## 🛡️ Security

**Before production deployment:**
1. Change all default passwords in `.env`
2. Generate strong secrets for `JWT_SECRET` and `NEXTAUTH_SECRET`
3. Configure firewall to restrict port access
4. Set up HTTPS with reverse proxy

## 📚 Full Documentation

For complete setup instructions, troubleshooting, and production deployment guide, see:
- [`deployment/DOCKER.md`](deployment/DOCKER.md) - Complete Docker deployment guide

## 🆘 Troubleshooting

**Common Issues:**
1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Database connection**: Check MySQL container logs: `docker compose logs mysql`
3. **App won't start**: Check app logs: `docker compose logs app`

**Need Help?**
- Check application health: `curl http://localhost:3000/api/health`
- View all logs: `docker compose logs -f`
- Verify configuration: `docker compose config`