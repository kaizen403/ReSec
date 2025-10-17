const express = require('express');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/db');

const AFFILIATE_FLAG = process.env.AFFILIATE_FLAG || 'PCTFS{pctfs_vip_coupon:R3S3CURITY143}';

const router = express.Router();

// Invoice download - INTENTIONALLY VULNERABLE TO PATH TRAVERSAL
router.get('/download/invoice', async (req, res) => {
  try {
    const { file } = req.query;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'File parameter required'
      });
    }
    
    // VULNERABILITY 1: Path traversal through file parameter
    // Weak validation can be bypassed with ....// technique
    
    // Weak validation - blocks simple ../ but not ....//
    if (file.includes('..') && !file.includes('....//')) {
      return res.status(400).json({ 
        error: 'Invalid file path detected'
      });
    }
    
    // VULNERABILITY: ....// bypass works by replacing with ../ after check
    let processedFile = file.replace(/\.\.\.\.\/\//g, '../');
    
    // Also vulnerable to direct absolute paths
    let finalPath;
    if (processedFile.startsWith('/')) {
      finalPath = processedFile;
    } else {
      const baseDir = '/app/invoices';
      finalPath = path.join(baseDir, processedFile);
    }
    
    // VULNERABILITY: No proper path validation
    try {
      const fileContent = fs.readFileSync(finalPath, 'utf8');
      
      // Successful path traversal - return file content with flag
      return res.send(fileContent + '\nPCTFS{path_traversal_invoice_download_bypass}');
    } catch (err) {
      res.status(404).json({ 
        error: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile picture upload - INTENTIONALLY VULNERABLE TO PATH TRAVERSAL  
router.post('/upload/profile-picture', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ 
        error: 'Filename and content required'
      });
    }
    
    // VULNERABILITY 2: Path traversal through filename parameter
    
    // Decode URL encoding (but vulnerable to double encoding)
    const decodedFilename = decodeURIComponent(filename);
    
    const uploadDir = '/app/uploads/profiles';
    const filePath = path.join(uploadDir, decodedFilename);
    
    // Weak validation - blocks ../ but can be bypassed
    if (decodedFilename.includes('..')) {
      return res.status(400).json({ 
        error: 'Invalid filename'
      });
    }
    
    // VULNERABILITY: Can read files with absolute paths or double encoding
    // Check if trying to read sensitive files
    if (decodedFilename.startsWith('/')) {
      // Absolute path - try to read it
      try {
        const secretContent = fs.readFileSync(decodedFilename, 'utf8');
        
        // Successful path traversal - return content with flag
        return res.send(secretContent + '\nPCTFS{path_traversal_profile_picture_bypass}');
      } catch (err) {
        return res.status(404).json({ error: 'File not found' });
      }
    }
    
    // Normal upload response (simulated)
    res.json({ message: 'Profile picture uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Open Redirect 1: Post-login redirect - INTENTIONALLY VULNERABLE
router.post('/auth/login-redirect', async (req, res) => {
  try {
    const { email, password, next } = req.body;
    
    // Authenticate user (simplified)
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;
    
    // VULNERABILITY: Open redirect via 'next' parameter
    // Weak domain validation can be bypassed with:
    // - @attacker.com (domain validation bypass)
    // - //attacker.com (protocol-relative URL)
    // - https://trusted.com@attacker.com (credentials in URL)
    // - https://trusted.com.attacker.com (subdomain)
    
    let redirectUrl = next || '/';
    const trustedDomain = 'localhost';
    const isAbsolute = typeof redirectUrl === 'string' && /^(?:https?:)?\/\//i.test(redirectUrl);
    const looksTrusted = typeof redirectUrl === 'string' && redirectUrl.includes(trustedDomain);
    const flagValue = redirectUrl && redirectUrl.toLowerCase().includes('evil')
      ? (process.env.OPEN_REDIRECT_FLAG || 'PCTFS{open_redirect_post_login}')
      : undefined;

    if (flagValue) {
      res.set('X-Open-Redirect-Flag', flagValue);
    }

    res.set('X-Login-Redirect', redirectUrl);

    if (!isAbsolute && !redirectUrl.startsWith('/')) {
      redirectUrl = '/';
    }

    // Trusted domains short-circuit to a straight redirect as well
    if (looksTrusted || redirectUrl.startsWith('/') || isAbsolute) {
      return res.redirect(redirectUrl);
    }

    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Open Redirect 2: Affiliate tracking - INTENTIONALLY VULNERABLE
router.get('/track', (req, res) => {
  try {
    const { partner_id, redirect } = req.query;
    
    if (!redirect) {
      return res.status(400).json({ error: 'Redirect parameter required' });
    }
    
    // VULNERABILITY: Open redirect via 'redirect' parameter
    // URL encoding bypass:
    // - Encoding special characters to bypass allowlist
    // - Double encoding: %2568%2574%2574%2570 = http
    // - Unicode encoding: \u0068\u0074\u0074\u0070 = http
    
    // Weak validation - checks for http/https
    const decodedRedirect = decodeURIComponent(redirect);
    
    if (decodedRedirect.toLowerCase().includes('http')) {
      // VULNERABILITY: Can be bypassed with encoding
      // But we're checking the decoded value, so it catches some cases
      // However, double encoding can still bypass
      
      // Check if it's an affiliate link (for the CTF)
      if (partner_id && decodedRedirect.includes('evil')) {
        return res.json({
          message: 'Affiliate link tracked',
          redirect: decodedRedirect,
          partner_id: partner_id,
          flag: AFFILIATE_FLAG
        });
      }
      
      if (!decodedRedirect.startsWith('http://localhost') && !decodedRedirect.startsWith('https://localhost')) {
        return res.redirect(302, '/affiliate?notice=external-blocked');
      }

      // Normal redirect
      return res.redirect(302, decodedRedirect);
    }
    
    // If no protocol, assume relative URL (still vulnerable)
    if (decodedRedirect.startsWith('http://') || decodedRedirect.startsWith('https://')) {
      return res.redirect(302, '/affiliate?notice=external-blocked');
    }

    res.redirect(302, decodedRedirect);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
