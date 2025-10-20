#!/bin/bash

echo "🚀 Starting ShopSmart Development Environment..."
echo ""

# Stop any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f 'nodemon' 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true

# Start Docker services
echo "🐳 Starting Docker services (DB, Redis, Internal API)..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for database to be ready..."
until docker exec shopsmart-db pg_isready -U shop &>/dev/null; do
  echo -n "."
  sleep 1
done
echo " ✅ Database ready!"

# Database setup and seeding
echo "📦 Setting up database schema and seeding data..."
cd be
npm run prisma:push 2>&1 | grep -E "(Applied|Already|Error)" || true
npm run prisma:seed 2>&1 | grep -E "(Seeded|Error|products|users)" || echo "✅ Database seeded"
cd ..

echo ""
echo "✨ Starting API and Frontend servers..."
echo ""
echo "📍 Services will be available at:"
echo "   🔹 Frontend: http://localhost:3000"
echo "   🔹 Backend API: http://localhost:4000"
echo "   🔹 API Health: http://localhost:4000/health"
echo "   🔹 Swagger: http://localhost:4000/swagger.json"
echo ""
echo "💡 Press Ctrl+C to stop all services"
echo ""

# Start development image.pngservers with concurrently
npm run dev

