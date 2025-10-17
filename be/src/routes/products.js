const express = require('express');
const { Pool } = require('pg');
const prisma = require('../lib/db');

const router = express.Router();

// Create PostgreSQL pool for raw SQL queries (intentionally vulnerable)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get all products (safe)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const products = await prisma.product.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.product.count();
    
    res.json({
      items: products,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products - INTENTIONALLY VULNERABLE TO SQL INJECTION
router.get('/products/search', async (req, res) => {
  try {
    const { q = '', category = '' } = req.query;
    
    // VULNERABILITY: SQL injection via string concatenation
    const conditions = [];
    
    if (q) {
      // This allows SQL injection through the search query
      conditions.push(`name ILIKE '%${q}%'`);
    }
    
    if (category) {
      // This allows SQL injection through category parameter
      // Example payload: ?category=1 OR 1=1 UNION SELECT * FROM admin_secret
      conditions.push(`category_id = ${category}`);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
    
    const sql = `
      SELECT * 
      FROM product
      ${whereClause}
      ORDER BY id DESC
      LIMIT 20
    `;
    
    const { rows } = await pool.query(sql);
    
    res.json({
      items: rows,
      query: q,
      category
    });
  } catch (error) {
    // Intentionally expose error details
    res.status(500).json({ error: error.message, detail: error.detail });
  }
});

// Get product suggestions (for autocomplete)
router.get('/products/suggest', async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        priceCents: true
      },
      take: 5
    });
    
    res.json({ suggestions: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const detectXssPayload = (value = '') => {
  return /<|>|on\w+=|javascript:|alert\s*\(|script|svg|img/i.test(String(value));
};

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const parsedId = parseInt(rawId, 10);
    const possibleXss = detectXssPayload(rawId);
    const reflectedFlag = process.env.XSS_REFLECTED_FLAG || 'PCTFS{reflected_xss_alert_flag}';

    if (Number.isNaN(parsedId)) {
      if (possibleXss) {
        res.set('X-XSS-Flag', reflectedFlag);
      }
      return res.status(404).json({
        error: 'Product not found',
        xssFlag: possibleXss ? reflectedFlag : undefined
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedId },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      }
    });
    
    if (!product) {
      if (possibleXss) {
        res.set('X-XSS-Flag', reflectedFlag);
      }
      return res.status(404).json({
        error: 'Product not found',
        xssFlag: possibleXss ? reflectedFlag : undefined
      });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


