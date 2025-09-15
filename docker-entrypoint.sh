#!/bin/bash
set -e

echo "🚀 Starting Fashion CMS Application..."

# Wait for MySQL to be ready using built-in approach
echo "⏳ Waiting for MySQL database to be ready..."
while ! nc -z mysql 3306; do
  echo "Waiting for MySQL..."
  sleep 2
done
echo "✅ MySQL is ready!"

# Run Prisma migrations and setup
echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

echo "📊 Generating Prisma client..."
npx prisma generate

echo "🌱 Database setup complete!"

echo "🎯 Starting Next.js application..."
# Start the Next.js application using npm start
exec npm start