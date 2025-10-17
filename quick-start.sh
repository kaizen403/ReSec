#!/bin/bash

# 🚀 Hackazon Quick Start Script
# Automatically sets up and starts the entire vulnerable application

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🔒 Hackazon Quick Start Script 🔒                  ║"
echo "║     Intentionally Vulnerable E-Commerce Application        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Stop any existing containers
echo -e "${YELLOW}📦 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo ""

# Proactively rebuild images so apt mirrors use HTTPS before starting
echo -e "${YELLOW}🔧 Building Docker images (forcing HTTPS mirrors)...${NC}"
if ! docker-compose build api; then
    echo -e "${RED}✗ Image build failed. Ensure outbound HTTPS (443) access to deb.debian.org is allowed and rerun.${NC}"
    exit 1
fi
echo ""

# Start services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 15

# Check if database is ready
echo -e "${YELLOW}🗄️  Checking database status...${NC}"
until docker exec shopsmart-db pg_isready -U shop > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done
echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Run database migrations
echo -e "${YELLOW}📋 Running database migrations...${NC}"
docker exec shopsmart-api npm run prisma:push > /dev/null
echo ""

# Seed database
echo -e "${YELLOW}🌱 Seeding database with test data and flags...${NC}"
docker exec shopsmart-api npm run prisma:seed
echo ""

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"
sleep 5

# Check backend
if curl -s http://localhost:4000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ Backend API is healthy${NC}"
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
fi

# Check frontend (might take longer to start)
echo -e "${YELLOW}   Waiting for frontend to build...${NC}"
sleep 10
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Frontend might still be building (check logs)${NC}"
fi

# Check internal API
if docker exec shopsmart-internal-api ps | grep -q "node"; then
    echo -e "${GREEN}✓ Internal API (SSRF target) is running${NC}"
else
    echo -e "${RED}✗ Internal API is not running${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Setup Complete!                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📍 Access URLs:${NC}"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:4000"
echo "   Nginx Proxy:  http://localhost"
echo ""
echo -e "${BLUE}🔐 Test Credentials:${NC}"
echo "   Admin:  admin@shopsmart.com / admin123"
echo "   User 1: john@example.com / password123"
echo "   User 2: jane@example.com / password123"
echo ""
echo -e "${BLUE}🧪 Quick Tests:${NC}"
echo "   1. SQL Injection:"
echo "      curl \"http://localhost:4000/api/v1/products/search?category=1%20OR%201=1\""
echo ""
echo "   2. SSTI:"
echo "      curl \"http://localhost:4000/api/v1/invoice/1?note={{7*7}}\""
echo ""
echo "   3. IDOR:"
echo "      curl http://localhost:4000/api/v1/user/1"
echo ""
echo "   4. Config Leak:"
echo "      curl http://localhost:4000/api/v1/config -H \"x-admin-key: admin\""
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   README.md                              - Project overview"
echo "   COMPLETE_VULNERABILITY_TEST_GUIDE.md   - Detailed testing guide"
echo "   COMPLETE_IMPLEMENTATION_SUMMARY.md     - Technical details"
echo "   FINAL_COMPLETION_REPORT.md             - Implementation report"
echo ""
echo -e "${BLUE}🧪 Run Full Test Suite:${NC}"
echo "   ./test-all-vulnerabilities.sh"
echo ""
echo -e "${BLUE}📊 View Logs:${NC}"
echo "   docker-compose logs -f              # All services"
echo "   docker-compose logs -f api          # Backend only"
echo "   docker-compose logs -f web          # Frontend only"
echo ""
echo -e "${BLUE}🛑 Stop Services:${NC}"
echo "   docker-compose down                 # Stop all"
echo "   docker-compose down -v              # Stop and remove data"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This application is INTENTIONALLY VULNERABLE${NC}"
echo -e "${YELLOW}   DO NOT expose to the internet or use in production!${NC}"
echo ""
echo -e "${GREEN}🎉 Happy Hacking! 🔒${NC}"


