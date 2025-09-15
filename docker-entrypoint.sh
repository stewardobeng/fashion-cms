#!/bin/bash
set -e

echo "🚀 Starting Fashion CMS Application..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL database to be ready..."
/usr/local/bin/wait-for-it.sh mysql:3306 --timeout=60 --strict -- echo "✅ MySQL is ready!"

# Run Prisma migrations and seed
echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

echo "📊 Generating Prisma client..."
npx prisma generate

echo "🌱 Database setup complete!"

echo "🎯 Starting Next.js application..."
# Start the Next.js application
exec node server.js