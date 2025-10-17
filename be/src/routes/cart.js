const express = require('express');

const router = express.Router();

// Cart is handled client-side with localStorage
// This is just a placeholder for any server-side cart operations

router.get('/cart', (req, res) => {
  res.json({ message: 'Cart is managed client-side' });
});

module.exports = router;




