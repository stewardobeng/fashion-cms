# Shared Hosting Deployment Guide

## Prerequisites
- cPanel access or FTP access to your shared hosting
- MySQL database support
- Node.js support (if available) or static file serving

## Steps for Shared Hosting Deployment

### Option 1: Static Export (Recommended for basic shared hosting)

1. **Build for static export:**
   ```bash
   npm run build
   DEPLOYMENT_TARGET=static npm run export
   ```

2. **Upload files:**
   - Upload contents of `out/` folder to your `public_html` directory
   - Ensure `.htaccess` file is uploaded for client-side routing

3. **Database setup:**
   - Create MySQL database through cPanel
   - Import the database schema (Prisma will handle this)
   - Update environment variables in your hosting control panel

### Option 2: Full Next.js Deployment (For hosting with Node.js support)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload files:**
   - Upload entire project to your hosting directory
   - Ensure `node_modules` are installed on the server
   - Set up environment variables

3. **Start the application:**
   ```bash
   npm start
   ```

## Database Configuration

1. **Create MySQL database** in cPanel
2. **Update DATABASE_URL** in your environment variables:
   ```
   DATABASE_URL=\"mysql://username:password@host:3306/database_name\"
   ```
3. **Run database migrations** (if server supports it):
   ```bash
   npx prisma db push
   ```

## Environment Variables for Shared Hosting

```env
DATABASE_URL=\"mysql://your_db_user:your_db_password@your_db_host:3306/your_db_name\"
JWT_SECRET=\"your-super-secure-production-secret\"
NODE_ENV=\"production\"
```

## .htaccess for Client-Side Routing

Create this `.htaccess` file in your `public_html` directory:

```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection \"1; mode=block\"

# GZIP Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css \"access plus 1 year\"
    ExpiresByType application/javascript \"access plus 1 year\"
    ExpiresByType image/png \"access plus 1 year\"
    ExpiresByType image/jpg \"access plus 1 year\"
    ExpiresByType image/jpeg \"access plus 1 year\"
    ExpiresByType image/gif \"access plus 1 year\"
    ExpiresByType image/svg+xml \"access plus 1 year\"
</IfModule>
```

## Troubleshooting

1. **Database Connection Issues:**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database exists

2. **Routing Issues:**
   - Verify .htaccess file is uploaded
   - Check if mod_rewrite is enabled

3. **File Upload Issues:**
   - Check file permissions (usually 644 for files, 755 for directories)
   - Verify all files are uploaded completely