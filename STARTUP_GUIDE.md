# ShopSmart - Quick Start Guide

This guide will help you get the ShopSmart platform up and running quickly.

## Architecture

- **Docker**: Runs PostgreSQL, Redis, and Internal API (for SSRF testing)
- **Local Node.js**: Runs the Backend API and Frontend (faster, no build issues)

## Prerequisites

- Docker and Docker Compose
- Node.js v20+ and npm
- Port availability: 3000 (Frontend), 4000 (Backend), 5000 (Internal API), 5432 (PostgreSQL), 6379 (Redis)

## Quick Start (Recommended)

### Option 1: Use the startup script (Easiest)

```bash
./start.sh
```

This script will:
1. Clean up any existing processes
2. Start Docker services (DB, Redis, Internal API)
3. Wait for the database to be ready
4. Set up and seed the database
5. Start both API and Frontend servers concurrently

Press `Ctrl+C` to stop all services.

### Option 2: Manual step-by-step

```bash
# 1. Start Docker services
npm run docker:up

# 2. Seed the database
npm run db:seed

# 3. Start development servers
npm run dev
```

### Option 3: All-in-one command

```bash
npm start
```

## Available Scripts

### Main Commands

- `npm start` - Start everything (Docker + DB seed + Dev servers)
- `npm run dev` - Start API and Frontend concurrently (assumes Docker is running)
- `npm run stop` - Stop all services and processes
- `npm run setup` - Install all dependencies (be, fe, root)

### Docker Commands

- `npm run docker:up` - Start Docker services (DB, Redis, Internal API)
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker logs

### Database Commands

- `npm run db:seed` - Push Prisma schema and seed database

### Individual Service Commands

- `npm run dev:api` - Start only the backend API
- `npm run dev:fe` - Start only the frontend

### Cleanup

- `npm run clean` - Stop Docker and remove database volume (fresh start)

## Service URLs

Once running, access the services at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health
- **Swagger Documentation**: http://localhost:4000/swagger.json
- **Internal API** (for SSRF): http://localhost:5000 (internal only)

## Environment Variables

All necessary environment variables are configured in the npm scripts. Key variables include:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `PORT`: Backend server port (4000)
- `FRONTEND_ORIGIN`: Frontend URL for CORS
- Various feature flags for vulnerability testing

## Troubleshooting

### Ports already in use

```bash
# Check what's using the ports
ss -tlnp | grep -E ":(3000|4000|5432|6379)"

# Kill existing processes
npm run stop
```

### Database connection issues

```bash
# Check if database is running
docker ps | grep shopsmart-db

# View database logs
docker logs shopsmart-db

# Restart Docker services
npm run docker:down && npm run docker:up
```

### Fresh database needed

```bash
# Remove all data and start fresh
npm run clean
npm start
```

### Node modules issues

```bash
# Reinstall all dependencies
npm run setup
```

### Backend won't start - Missing modules

```bash
cd be
npm install
cd ..
```

### Frontend won't start

```bash
cd fe
npm install
cd ..
```

## Development Tips

1. **Auto-reload**: Both API (nodemon) and Frontend (Next.js) have hot-reload enabled
2. **Logs**: The concurrently output shows both API and Frontend logs with color coding
3. **Debug**: You can run `npm run dev:api` and `npm run dev:fe` in separate terminals for easier debugging
4. **Database**: Use any PostgreSQL client to connect to `postgresql://shop:shop@localhost:5432/shop`

## Stopping the Application

Press `Ctrl+C` in the terminal where you started the app, then run:

```bash
npm run stop
```

Or manually:

```bash
# Stop Docker services
docker-compose down

# Kill Node processes
pkill -f nodemon
pkill -f "next dev"
```

## Project Structure

```
med-lab/
├── be/                 # Backend API (Express.js)
├── fe/                 # Frontend (Next.js)
├── infra/             # Infrastructure configs
├── secrets/           # Flag files
├── docker-compose.yml # Docker services only (DB, Redis, Internal API)
├── package.json       # Root package with concurrently scripts
├── start.sh          # Quick start script
└── STARTUP_GUIDE.md  # This file
```

## Security Notice

⚠️ **WARNING**: This application contains intentional security vulnerabilities for educational and testing purposes only. Do NOT deploy to production or expose to the internet.

