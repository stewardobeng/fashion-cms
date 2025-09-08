# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository (recommended)
- MySQL database (can use PlanetScale, Railway, or any MySQL provider)

## Steps for Vercel Deployment

### 1. Database Setup

Choose one of these database providers:

#### Option A: PlanetScale (Recommended)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get connection string
4. Add to Vercel environment variables

#### Option B: Railway
1. Create account at [railway.app](https://railway.app)
2. Create MySQL database
3. Get connection string
4. Add to Vercel environment variables

#### Option C: Your own MySQL server
1. Ensure your MySQL server is accessible from the internet
2. Configure firewall rules if necessary
3. Use the connection string in format: `mysql://user:password@host:3306/database`

### 2. Deploy to Vercel

#### Method 1: GitHub Integration (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m \"Initial commit\"
   git branch -M main
   git remote add origin https://github.com/yourusername/fashion-cms.git
   git push -u origin main
   ```

2. **Import project in Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click \"New Project\"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy

#### Method 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login and deploy:**
   ```bash
   vercel login
   vercel
   ```

3. **Configure environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   ```

### 3. Environment Variables

Add these environment variables in your Vercel project settings:

```env
DATABASE_URL=\"mysql://username:password@host:3306/database_name\"
JWT_SECRET=\"your-super-secure-jwt-secret-key\"
NODE_ENV=\"production\"
```

### 4. Database Schema

After deployment, initialize your database:

1. **Using Vercel CLI:**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. **Or manually run the SQL:**
   - Export your Prisma schema to SQL
   - Run it directly in your database provider's console

### 5. Custom Domain (Optional)

1. **Add domain in Vercel:**
   - Go to your project settings
   - Navigate to \"Domains\"
   - Add your custom domain

2. **Configure DNS:**
   - Point your domain's DNS to Vercel's servers
   - Follow Vercel's specific instructions for your domain provider

### 6. Performance Optimization

#### Enable Edge Functions
Update `vercel.json` for better performance:

```json
{
  \"version\": 2,
  \"functions\": {
    \"src/app/api/**/*.ts\": {
      \"maxDuration\": 30
    }
  },
  \"regions\": [\"iad1\", \"sfo1\"]
}
```

#### Caching Configuration
```json
{
  \"headers\": [
    {
      \"source\": \"/(.*)\",
      \"headers\": [
        {
          \"key\": \"Cache-Control\",
          \"value\": \"public, max-age=86400\"
        }
      ]
    }
  ]
}
```

## Monitoring and Analytics

### Enable Vercel Analytics
1. Go to your project dashboard
2. Navigate to \"Analytics\" tab
3. Enable Web Analytics
4. Add the analytics script to your app if needed

### Error Monitoring
1. **Enable Vercel Functions logs:**
   - View function logs in Vercel dashboard
   - Set up log drains for external monitoring

2. **Database monitoring:**
   - Use your database provider's monitoring tools
   - Set up alerts for performance issues

## Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   # Verify TypeScript compilation locally
   npm run build
   ```

2. **Database Connection:**
   ```bash
   # Test connection locally
   npx prisma db push
   # Check Vercel function logs for connection errors
   ```

3. **Environment Variables:**
   ```bash
   # Pull environment variables locally
   vercel env pull .env.local
   # Verify variables are set correctly
   vercel env ls
   ```

### Performance Issues

1. **Cold Starts:**
   - Use Vercel Pro for faster cold starts
   - Optimize bundle size
   - Enable edge functions where possible

2. **Database Performance:**
   - Use connection pooling
   - Optimize queries
   - Add database indexes

### Debugging

1. **Function Logs:**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Local Development:**
   ```bash
   vercel dev
   ```

## Maintenance

### Updates
1. **Automatic deployments:**
   - Push to main branch triggers deployment
   - Use preview deployments for testing

2. **Database migrations:**
   ```bash
   # For schema changes
   npx prisma db push
   # Or use migration files
   npx prisma migrate deploy
   ```

3. **Backup strategy:**
   - Regular database backups
   - Export application data
   - Version control for code changes