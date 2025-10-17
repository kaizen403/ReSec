require('dotenv').config();
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const cors = require('cors');
const pino = require('pino');

const swaggerDoc = require('../swagger.json');

const app = express();
const logger = pino({ transport: { target: 'pino-pretty' } });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ 
  origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:3000'], 
  credentials: true 
}));

// Redis setup
const redisClient = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// Intentionally predictable session IDs for the benchmark
let sessionCounter = 0;
const genid = () => `shopsmart_${Date.now()}_${sessionCounter++}`;

// Session setup
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'dev_secret',
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  genid,
  cookie: { 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip });
  next();
});

// Routes
app.use('/api/v1', require('./routes/auth'));
app.use('/api/v1', require('./routes/users'));
app.use('/api/v1', require('./routes/products'));
app.use('/api/v1', require('./routes/orders'));
app.use('/api/v1', require('./routes/reviews'));
app.use('/api/v1', require('./routes/wishlist'));
app.use('/api/v1', require('./routes/cart'));
app.use('/api/v1', require('./routes/config'));
app.use('/api/v1', require('./routes/admin'));
app.use('/api/v1', require('./routes/proxy'));
app.use('/api/v1', require('./routes/webhooks'));
app.use('/api/v1', require('./routes/invoice'));
app.use('/api/v1', require('./routes/xml'));
app.use('/api/v1', require('./routes/email'));
app.use('/api/v1', require('./routes/download'));

// Expose OpenAPI document for recon
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDoc);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 API server running on port ${PORT}`);
  logger.info(`⚠️  WARNING: This server contains intentional vulnerabilities for security testing only`);
});



