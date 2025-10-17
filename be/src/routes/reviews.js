const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

// Get reviews for a product
router.get('/reviews/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(req.params.productId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review - STORES XSS PAYLOAD
router.post('/reviews', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { productId, rating, text } = req.body;

    const parsedProductId = parseInt(productId);
    if (Number.isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, displayName: true }
    });

    const xssPattern = /<\s*(script|img|svg|iframe)|on\w+=|javascript:|alert\s*\(/i;
    const xssDetected = typeof text === 'string' && xssPattern.test(text);
    const flagValue = process.env.XSS_STORED_FLAG || 'PCTFS{stored_xss_alert_flag}';

    const review = {
      id: Date.now(),
      userId: req.session.userId,
      productId: parsedProductId,
      rating: parseInt(rating) || 0,
      text,
      createdAt: new Date().toISOString(),
      user
    };

    res.json({
      review,
      persisted: false,
      message: xssDetected
        ? 'XSS payload detected — returning flag and skipping persistence.'
        : 'Review accepted locally only (not persisted server-side).',
      flag: xssDetected ? flagValue : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin moderation endpoint - RENDERS WITH DANGEROUSLYSETINNERHTML
router.get('/reviews/admin/moderate', async (req, res) => {
  try {
    // Weak admin check - should verify session role
    if (req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        product: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    // This will be rendered in the admin panel with dangerouslySetInnerHTML
    // The XSS payload will execute and can access sessionStorage
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


