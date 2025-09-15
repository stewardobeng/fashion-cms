# Docker Deployment Guide for Fashion CMS

This guide will help you deploy the Fashion CMS application using Docker on Ubuntu or any Docker-supported system.

## 🎯 Overview

The Docker setup includes:
- **Fashion CMS Application** (Next.js)
- **MySQL Database** (with automatic initialization)
- **phpMyAdmin** (optional database management interface)

All services run on the same Docker network, eliminating latency between the app and database.

## 📋 Prerequisites

### System Requirements
- **Ubuntu 20.04+** (or any Docker-supported OS)
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **4GB RAM minimum** (8GB recommended)
- **10GB free disk space**

### Installing Docker on Ubuntu

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

## 🚀 Quick Start

### Method 1: Using Deployment Script (Recommended)

```bash
# Make the deployment script executable
chmod +x deploy-docker.sh

# Run the deployment script
./deploy-docker.sh
```

### Method 2: Manual Deployment

```bash
# 1. Clone or upload your Fashion CMS code to the server
# cd /path/to/fashion-cms

# 2. Create environment configuration
cp .env.docker .env

# 3. Edit environment variables (IMPORTANT!)
nano .env

# 4. Build and start services
docker-compose up -d

# 5. Check status
docker-compose ps
```

## ⚙️ Configuration

### Environment Variables (.env)

**CRITICAL**: Update these secrets before deployment:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your-strong-root-password
MYSQL_DATABASE=fashion_cms
MYSQL_USER=fashionuser
MYSQL_PASSWORD=your-strong-user-password

# Application Secrets (CHANGE THESE!)
JWT_SECRET=your-256-bit-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# Application URL
NEXTAUTH_URL=http://your-server-ip:3000
```

### Port Configuration

### Port Configuration

Default ports:
- **Fashion CMS**: `3000`
- **MySQL**: `3306`
- **phpMyAdmin**: `8080`

#### Method 1: Environment Variables (Recommended)

Edit your `.env` file:
```bash
APP_PORT=8000           # Use port 8000 for the app
DB_PORT=3307            # Use port 3307 for MySQL
PHPMYADMIN_PORT=8081    # Use port 8081 for phpMyAdmin
```

#### Method 2: Direct Docker Compose Override

Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  app:
    ports:
      - "8000:3000"  # Change app to port 8000
  mysql:
    ports:
      - "3307:3306"  # Change MySQL to port 3307
  phpmyadmin:
    ports:
      - "8081:80"    # Change phpMyAdmin to port 8081
```

#### Method 3: Environment Variables at Runtime

```bash
# Linux/macOS
APP_PORT=8000 DB_PORT=3307 PHPMYADMIN_PORT=8081 docker compose up -d

# Windows
set APP_PORT=8000
set DB_PORT=3307
set PHPMYADMIN_PORT=8081
docker compose up -d
```

#### Method 4: Interactive Configuration

```bash
# Linux/macOS
chmod +x configure-ports.sh
./configure-ports.sh

# Windows
configure-ports.bat
```

#### Port Conflict Detection

Check if ports are available:
```bash
# Linux/macOS
netstat -tuln | grep :3000
nc -z localhost 3000 && echo "Port 3000 is in use" || echo "Port 3000 is available"

# Windows
netstat -an | findstr :3000
```

## 🔧 Management Commands

### Starting Services
```bash
# Docker Compose v2 (recommended)
docker compose up -d

# Docker Compose v1 (legacy)
docker-compose up -d
```

### Stopping Services
```bash
# Docker Compose v2
docker compose down

# Docker Compose v1
docker-compose down
```

### Viewing Logs
```bash
# All services
docker compose logs -f
# or
docker-compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f mysql
```

### Restarting Services
```bash
# Restart all
docker compose restart
# or
docker-compose restart

# Restart specific service
docker compose restart app
```

### Updating Application
```bash
# Stop services
docker compose down

# Rebuild with latest code
docker compose build --no-cache

# Start services
docker compose up -d
```

## 🗄️ Database Management

### Using phpMyAdmin
1. Open `http://your-server-ip:8080`
2. Login with:
   - Server: `mysql`
   - Username: `fashionuser` (or your MYSQL_USER)
   - Password: Your MYSQL_PASSWORD

### Using MySQL Command Line
```bash
# Connect to MySQL container
docker-compose exec mysql mysql -u fashionuser -p fashion_cms
```

### Database Backup
```bash
# Create backup
docker-compose exec mysql mysqldump -u fashionuser -p fashion_cms > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u fashionuser -p fashion_cms < backup.sql
```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
- [ ] Configure firewall to restrict access to ports
- [ ] Enable HTTPS with reverse proxy (nginx/traefik)
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

### Firewall Configuration (Ubuntu)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP (if using reverse proxy)
sudo ufw allow 80
sudo ufw allow 443

# Allow Fashion CMS (if direct access needed)
sudo ufw allow 3000

# Check status
sudo ufw status
```

## 🌐 Production Setup with Reverse Proxy

For production, use nginx as a reverse proxy:

### Install nginx
```bash
sudo apt install nginx
```

### nginx Configuration (`/etc/nginx/sites-available/fashion-cms`)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/fashion-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring and Troubleshooting

### Health Check
```bash
# Check application health
curl http://localhost:3000/api/health
```

### Common Issues

**1. Database Connection Failed**
```bash
# Check MySQL container logs
docker compose logs mysql

# Verify database is running
docker compose ps
```

**2. Application Won't Start**
```bash
# Check application logs
docker compose logs app

# Rebuild containers
docker compose down
docker compose build --no-cache
docker compose up -d
```

**3. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/fashion-cms
```

### Performance Optimization

**1. Resource Limits**
Add to `docker-compose.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

**2. Database Optimization**
```yaml
services:
  mysql:
    command: --innodb-buffer-pool-size=256M --max-connections=100
```

## 📈 Scaling Options

### Horizontal Scaling
```bash
# Run multiple app instances
docker-compose up -d --scale app=3
```

### Load Balancer Setup
Use nginx or traefik for load balancing multiple instances.

## 🔄 Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup-fashion-cms.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/fashion-cms"

mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T mysql mysqldump -u fashionuser -p$MYSQL_PASSWORD fashion_cms > $BACKUP_DIR/db_$DATE.sql

# Application data backup (if any uploads)
docker-compose exec app tar -czf - /app/public/uploads > $BACKUP_DIR/uploads_$DATE.tar.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Schedule with cron
```bash
# Add to crontab
0 2 * * * /path/to/backup-fashion-cms.sh
```

## 🆘 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Review this documentation
4. Check application health: `curl http://localhost:3000/api/health`

## 📝 Update Notes

When updating the Fashion CMS application:
1. Stop services: `docker-compose down`
2. Pull latest code changes
3. Rebuild: `docker-compose build --no-cache`
4. Start: `docker-compose up -d`
5. Check logs: `docker-compose logs -f`