const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');

const router = express.Router();

// XML product import - INTENTIONALLY VULNERABLE TO XXE (simulated)
router.post('/admin/import', async (req, res) => {
  try {
    // Weak auth bypass - just checking for any admin header
    const adminHeader = req.headers['x-admin'] || req.headers['x-admin-key'];
    
    if (!adminHeader) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { xml } = req.body;
    
    if (!xml) {
      return res.status(400).json({ error: 'XML data required' });
    }
    
    // VULNERABILITY: Simulated XXE - detect entity references in XML
    // Since fast-xml-parser doesn't support XXE naturally, we simulate it
    // by detecting entity references and resolving them manually
    // Real XXE payload: <!DOCTYPE data [<!ENTITY xxe SYSTEM "file:///app/secrets/flag.txt">]>
    
    try {
      // Check if XML contains entity definition
      const entityMatch = xml.match(/<!ENTITY\s+(\w+)\s+SYSTEM\s+"(.+?)"/);
      let resolvedXml = xml;
      
      let flagDisclosure = false;

      if (entityMatch) {
        const [, entityName, entityPath] = entityMatch;
        
        // VULNERABILITY: Read file system based on entity path
        try {
          const entityContent = fs.readFileSync(entityPath, 'utf8');
          // Replace entity references with file content
          resolvedXml = xml.replace(new RegExp(`&${entityName};`, 'g'), entityContent);
          // Remove the DOCTYPE declaration to prevent parser rejection
          resolvedXml = resolvedXml.replace(/<!DOCTYPE[^>]*>/g, '');
          flagDisclosure = true; // Any successful file read triggers flag disclosure
        } catch (fsError) {
          return res.status(400).json({ 
            error: 'XXE: File read failed',
            details: fsError.message 
          });
        }
      }
      
      // Parse the XML
      const parser = new XMLParser();
      const parsed = parser.parse(resolvedXml);
      
      const products = [];
      if (parsed.products && parsed.products.product) {
        const productData = Array.isArray(parsed.products.product) 
          ? parsed.products.product 
          : [parsed.products.product];
        
        productData.forEach(product => {
          products.push({
            content: typeof product === 'string' ? product : JSON.stringify(product),
            raw: typeof product === 'string' ? product : JSON.stringify(product)
          });
        });
      }

      const response = {
        message: 'Import processed',
        count: products.length,
        products: products
      };

      if (flagDisclosure) {
        response.flag = process.env.XXE_FLAG || 'PCTFS{xxe_file_read_external_entity}';
      }

      res.json(response);
    } catch (xmlError) {
      res.status(400).json({ 
        error: 'XML parsing error',
        details: xmlError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// XML invoice parser - INTENTIONALLY VULNERABLE TO XXE (simulated)
router.post('/invoice/parse', async (req, res) => {
  try {
    const { xml } = req.body;
    
    if (!xml) {
      return res.status(400).json({ error: 'XML data required' });
    }
    
    // VULNERABILITY: Same XXE vulnerability as above
    try {
      // Check if XML contains entity definition
      const entityMatch = xml.match(/<!ENTITY\s+(\w+)\s+SYSTEM\s+"(.+?)"/);
      let resolvedXml = xml;
      
      let flagDisclosure = false;

      if (entityMatch) {
        const [, entityName, entityPath] = entityMatch;
        
        // VULNERABILITY: Read file system based on entity path
        try {
          const entityContent = fs.readFileSync(entityPath, 'utf8');
          resolvedXml = xml.replace(new RegExp(`&${entityName};`, 'g'), entityContent);
          // Remove the DOCTYPE declaration to prevent parser rejection
          resolvedXml = resolvedXml.replace(/<!DOCTYPE[^>]*>/g, '');
          flagDisclosure = true; // Matching lab guide: first successful read leaks the flag
        } catch (fsError) {
          return res.status(400).json({ 
            error: 'XXE: File read failed',
            details: fsError.message 
          });
        }
      }
      
      // Parse the XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
      });
      const parsed = parser.parse(resolvedXml);
      
      const invoices = [];
      if (parsed.invoices && parsed.invoices.invoice) {
        const invoiceData = Array.isArray(parsed.invoices.invoice) 
          ? parsed.invoices.invoice 
          : [parsed.invoices.invoice];
        
        invoiceData.forEach(invoice => {
          invoices.push({
            id: invoice['@_id'] || null,
            content: typeof invoice === 'string' ? invoice : JSON.stringify(invoice),
            raw: typeof invoice === 'string' ? invoice : JSON.stringify(invoice)
          });
        });
      }

      const response = {
        message: 'Invoice XML parsed',
        count: invoices.length,
        invoices: invoices
      };

      if (flagDisclosure) {
        response.flag = process.env.XXE_FLAG || 'PCTFS{xxe_file_read_external_entity}';
      }

      res.json(response);
    } catch (xmlError) {
      res.status(400).json({ 
        error: 'XML parsing error',
        details: xmlError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

