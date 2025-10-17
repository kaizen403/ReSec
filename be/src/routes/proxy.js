const express = require('express');
const https = require('https');
const http = require('http');

const router = express.Router();

// Image proxy - INTENTIONALLY VULNERABLE TO SSRF
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }
    
    // VULNERABILITY 1: Case-sensitive file:// scheme check can be bypassed with File://
    if (url.toLowerCase().startsWith('file://')) {
      return res.status(400).json({ error: 'File URLs not allowed' });
    }
    
    // VULNERABILITY 2: No blacklist for internal IP ranges
    // Allows accessing http://localhost:5000/secret, http://internal-api:5000/secret
    // or cloud metadata endpoints like http://169.254.169.254/latest/meta-data/
    
    const urlObj = new URL(url);
    const proto = urlObj.protocol === 'https:' ? https : http;
    
    proto.get(url, (proxyRes) => {
      let data = '';
      
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      
      proxyRes.on('end', () => {
        // Check if the response contains the flag
        if (data.includes('PCTFS{')) {
          res.setHeader('Content-Type', 'application/json');
          res.json({ data, flag: 'FLAG_FOUND' });
        } else {
          res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'text/plain');
          res.send(data);
        }
      });
    }).on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




