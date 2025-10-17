const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

// Get user wishlist
router.get('/wishlist', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.session.userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/wishlist', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { productId } = req.body;
    
    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.session.userId,
        productId: parseInt(productId)
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }
    
    const item = await prisma.wishlistItem.create({
      data: {
        userId: req.session.userId,
        productId: parseInt(productId)
      },
      include: {
        product: true
      }
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/wishlist/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    await prisma.wishlistItem.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.session.userId
      }
    });
    
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




