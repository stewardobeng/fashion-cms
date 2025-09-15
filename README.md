# Fashion Client Management System

A complete client management solution for fashion firms.

## Quick Start

### Local Development
```bash
npm install
npm run db:generate
npm run dev
```

### Production Build
```bash
npm install --production
npm run build
npm start
```

### Database Setup
1. Configure DATABASE_URL in .env
2. Run `npm run db:push` to create tables
3. Visit `/setup` to initialize data

## Deployment

- **Docker** (Recommended): See `README-DOCKER.md` for one-command deployment
- **Vercel**: See `deployment/VERCEL.md`
- **Shared Hosting**: See `deployment/SHARED_HOSTING.md`

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL`: MySQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL