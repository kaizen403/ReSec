const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

// Admin dashboard
router.get('/admin/dashboard', async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = {
      totalUsers: await prisma.user.count(),
      totalOrders: await prisma.order.count(),
      totalProducts: await prisma.product.count(),
      totalReviews: await prisma.review.count()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin API index
router.get('/admin', (req, res) => {
  res.json({
    service: 'Hackazon Admin API',
    description: 'Administrative endpoints for catalog management and debug tooling.',
    endpoints: [
      {
        path: '/api/v1/admin/debug',
        method: 'POST',
        status: 'active',
        usage: 'Send {"pin":"<pin>","code":"<javascript expression>"}.',
        note: 'The debug console evaluates code inside a restricted sandbox. Example: curl -sS -X POST http://localhost:4000/api/v1/admin/debug -H "Content-Type: application/json" -d {"pin":"1234","code":"return Object.keys(globalThis)"}',
      },
      {
        path: '/api/v1/admin/upload-product-image',
        method: 'POST',
        status: 'active',
        usage: 'Send {"productId":1,"format":"<format>"} with image metadata JSON.',
        note: 'Legacy Pillow 8.1.0 format handlers remain enabled for compatibility testing.'
      },
      {
        path: '/api/v1/admin/import',
        method: 'POST',
        status: 'active',
        usage: 'Send {"xml":"<products>...</products>"} with header x-admin:true.',
        note: 'Processes XML catalog data and supports custom entity definitions.'
      }
    ]
  });
});

// Debug console - INTENTIONALLY VULNERABLE (Simulates Werkzeug debug console)
router.post('/admin/debug', (req, res) => {
  try {
    const { pin, code } = req.body;
    
    if (!pin || !code) {
      return res.status(400).json({
        error: 'PIN and code required',
        description: 'Werkzeug Debug Console - Protected by PIN',
        common_pins: ['0000', '1111', '1234', '9999'],
        usage: 'Send {"pin":"XXXX","code":"your_javascript_code"}'
      });
    }
    
    // VULNERABILITY 1: Weak predictable PIN (like Werkzeug's weak PIN generation)
    if (pin !== '1234') {
      return res.status(403).json({ 
        error: 'Invalid PIN',
        attempts_remaining: 'unlimited'
      });
    }
    
    // VULNERABILITY 2: eval() allows arbitrary code execution
    // BUT: Use VM sandbox to isolate from process.env and other flags
    const vm = require('vm');
    
    const debug_secrets = {
      console_flag: process.env.VULN_COMPONENT_FLAG || 'PCTFS{eval_debug_console_rce}',
      debug_mode: true,
      internal_api_key: 'DEBUG_KEY_12345',
      version: '1.0.0'
    };
    
    try {
      // Create isolated sandbox context
      // Only debug_secrets is accessible, not process.env or require
      const sandbox = {
        debug_secrets: debug_secrets,
        // Allow basic utilities
        JSON: JSON,
        Object: Object,
        Array: Array,
        String: String,
        Number: Number,
        Math: Math
      };
      
      // Execute code in isolated VM context
      const context = vm.createContext(sandbox);
      const result = vm.runInContext(code, context, {
        timeout: 1000,
        displayErrors: true
      });
      
      const response = {
        result: result,
        console_type: 'Debug Console (Isolated)',
        code_executed: code
      };
      
      res.json(response);
    } catch (evalError) {
      res.status(400).json({ 
        error: 'Execution error',
        details: evalError.message,
        note: 'Console is sandboxed - only debug_secrets is available'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image upload endpoint - INTENTIONALLY VULNERABLE (simulates Pillow vulnerability)
router.post('/admin/upload-product-image', async (req, res) => {
  try {
    const { productId, imageData, format } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        error: 'productId required',
        description: 'Product Image Upload API',
        image_library: 'Pillow 8.1.0',
        supported_formats: ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'EPS'],
        vulnerability_info: 'Check CVE database for Pillow 8.1.0 vulnerabilities',
        usage: 'Send {"productId":1,"imageData":"base64...","format":"JPEG"}'
      });
    }
    
    // VULNERABILITY: Accepts image data without proper validation
    // CVE-2021-25287 affects Pillow versions < 8.1.1
    // Buffer overflow can occur with specially crafted EPS files
    
    // Simulate vulnerability trigger
    if (format && (format.toUpperCase() === 'EPS' || format === 'EPS')) {
      // EPS format triggers the vulnerability
      // CVE-2021-25287: Buffer overflow in EPS format processing
      // Simulates memory corruption that leaks adjacent memory containing the Pillow flag
      const pillow_internal_memory = {
        image_buffer: '0x7fff5fbff000',
        pillow_version: '8.1.0',
        eps_parser_state: 'corrupted',
        adjacent_memory_leak: process.env.PILLOW_FLAG || 'PCTFS{pillow_8_1_0_buffer_overflow_memory_leak}'
      };
      
      return res.json({
        message: 'Processing EPS format...',
        warning: 'EPS format detected - this format has known vulnerabilities in Pillow 8.1.0',
        cve: 'CVE-2021-25287',
        pillow_version: '8.1.0',
        vulnerability_triggered: true,
        // Memory corruption exposes internal Pillow memory structure
        memory_corruption: {
          status: 'Buffer overflow detected',
          affected_region: 'EPS parser buffer'
        },
        // Flag exposed through simulated buffer overflow memory leak
        leaked_memory: pillow_internal_memory
      });
    }
    
    // Normal response
    res.json({
      message: 'Image upload endpoint ready',
      productId,
      image_processor: 'Pillow 8.1.0',
      accepted_formats: ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'EPS'],
      warning: 'Pillow 8.1.0 is outdated - consider upgrading'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
