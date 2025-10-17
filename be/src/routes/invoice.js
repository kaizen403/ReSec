const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

const SAFE_MATH = /^[0-9+\-*/().\s]+$/;
const SAFE_PATH = /^[a-zA-Z][a-zA-Z0-9_]*$/;

function resolvePath(context, path) {
  const segments = path.split('.');
  let current = context;

  for (const segment of segments) {
    if (!SAFE_PATH.test(segment)) {
      return undefined;
    }
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object' && typeof current !== 'function') {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}

function evaluateExpression(expression, context) {
  const trimmed = expression.trim();

  if (!trimmed) {
    return '';
  }

  if (SAFE_MATH.test(trimmed)) {
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${trimmed});`)();
      return result !== undefined ? result : '';
    } catch (err) {
      return `[error:${err.message}]`;
    }
  }

  if (/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(trimmed)) {
    const value = resolvePath(context, trimmed);
    return value !== undefined && value !== null ? value : '';
  }

  return '[blocked]';
}

function renderNoteTemplate(template, context) {
  return template.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, expr) => {
    const rendered = evaluateExpression(expr, context);
    return rendered === undefined || rendered === null ? '' : String(rendered);
  });
}

// Get invoice data - INTENTIONALLY VULNERABLE TO SSTI
router.get('/invoice/:id', async (req, res) => {
  try {
    const { note } = req.query;
    
    // Get order data
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const invoiceData = {
      id: order.id,
      invoiceNumber: `INV-2025-${order.id}`,
      date: order.createdAt.toISOString().split('T')[0],
      customer: {
        name: order.user.displayName || order.user.username,
        email: order.user.email
      },
      items: order.items.map(item => ({
        description: item.product.name,
        qty: item.qty,
        priceCents: item.priceCents
      })),
      totalCents: order.totalCents,
      note: note || ''
    };
    
    if (note) {
      const availableTokens = ['flag', 'customer.name', 'customer.email', 'total', 'totalCents'];

      const templateContext = {
        flag: process.env.SHOPSMART_FLAG || '',
        customer: invoiceData.customer,
        totalCents: invoiceData.totalCents,
        total: (invoiceData.totalCents / 100).toFixed(2),
        invoice: invoiceData,
        available_tokens: availableTokens
      };

      const renderedNote = renderNoteTemplate(note, templateContext);
      invoiceData.note = renderedNote;
    }
    
    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

