const express = require('express');
const { Pool } = require('pg');
const prisma = require('../lib/db');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get user orders
router.get('/orders', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId: req.session.userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order - INTENTIONALLY VULNERABLE TO IDOR AND SQL INJECTION
router.get('/orders/:id', async (req, res) => {
  try {
    const userId = req.session.userId || 0;
    const orderId = req.params.id; // Not sanitized!
    
    // VULNERABILITY 1: SQL Injection through orderId
    // VULNERABILITY 2: Weak owner check that can be bypassed with UNION
    // Example payload: /orders/1 UNION SELECT * FROM order WHERE user_id=1
    const sql = `
      SELECT o.* 
      FROM "order" o
      WHERE o.id = ${orderId} AND o.user_id = ${userId}
    `;
    
    const { rows } = await pool.query(sql);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const items = await prisma.orderItem.findMany({
      where: { orderId: parseInt(rows[0].id) },
      include: { product: true }
    });
    
    res.json({
      ...rows[0],
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message, detail: error.detail });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { items, giftNote } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }
    
    // Calculate total
    let totalCents = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (product) {
        totalCents += product.priceCents * item.qty;
      }
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.session.userId,
        status: 'pending',
        totalCents,
        giftNote,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            priceCents: item.priceCents
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




