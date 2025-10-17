const express = require('express');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const prisma = require('../lib/db');

const router = express.Router();

// Create email transporter (for demo - won't actually send)
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, // MailHog for local testing
  ignoreTLS: true
});

// Send order confirmation email - INTENTIONALLY VULNERABLE TO SSTI
router.post('/orders/:id/send-confirmation', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

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

    // Check ownership
    if (order.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Not your order' });
    }

    // VULNERABILITY: Email template with SSTI via displayName
    // The user's displayName is rendered directly in the EJS template without sanitization
    // Example payload in displayName: <%= process.env.SSTI_EMAIL_FLAG %>
    
    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #3b82f6; color: white; padding: 20px; }
    .content { padding: 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Order Confirmation</h1>
  </div>
  <div class="content">
    <p>Dear <%= customerName %>,</p>
    <p>Thank you for your order! Your order #<%= orderId %> has been confirmed.</p>
    
    <h3>Order Details:</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <% items.forEach(function(item) { %>
        <tr>
          <td><%= item.product.name %></td>
          <td><%= item.qty %></td>
          <td>$<%= (item.priceCents / 100).toFixed(2) %></td>
        </tr>
        <% }); %>
      </tbody>
    </table>
    
    <p><strong>Total: $<%= (totalCents / 100).toFixed(2) %></strong></p>
    
    <p>We'll send you another email when your order ships.</p>
    
    <p>Best regards,<br>The Hackazon Team</p>
  </div>
  <div class="footer">
    <p>&copy; 2025 Hackazon. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    try {
      // VULNERABILITY: User's displayName is rendered without sanitization
      // If displayName contains <%= ... %>, it will be executed as EJS code
      const html = ejs.render(emailTemplate, {
        customerName: order.user.displayName || order.user.username, // VULNERABLE!
        orderId: order.id,
        items: order.items,
        totalCents: order.totalCents
      });

      let response = {
        message: 'Order confirmation email rendered',
        to: order.user.email,
        subject: `Order Confirmation - Order #${order.id}`,
        template_engine: 'EJS',
        html: html,
        note: 'Email not actually sent (demo mode)'
      };
      
      // Provide hints if SSTI is detected
      if (order.user.displayName && (order.user.displayName.includes('<%') || order.user.displayName.includes('{{'))) {
        response.security_note = 'Template syntax detected in displayName!';
        response.template_syntax = 'EJS uses <%= %> for output, <% %> for code';
        response.hint = 'User-controlled data is being rendered in email template. Available objects: all variables passed to template';
      }

      // For demo purposes, return the rendered HTML instead of sending
      res.json(response);

    } catch (err) {
      res.status(500).json({ 
        error: 'Email template rendering failed',
        details: err.message,
        template_engine: 'EJS',
        hint: 'Template errors may reveal server-side details. Try valid EJS syntax: <%= 1+1 %>'
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to update displayName (for SSTI testing)
router.put('/profile/update-display-name', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { displayName } = req.body;
    
    if (!displayName) {
      return res.status(400).json({
        error: 'displayName required',
        description: 'Update your profile display name',
        note: 'This name appears in order confirmation emails',
        usage: 'Send {"displayName":"Your Name"}'
      });
    }

    // VULNERABILITY: No sanitization of displayName
    // Allows SSTI payload to be stored
    const user = await prisma.user.update({
      where: { id: req.session.userId },
      data: { displayName },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true
      }
    });
    
    let response = {
      ...user,
      message: 'Display name updated successfully',
      note: 'Your new display name will appear in order confirmation emails'
    };
    
    // Provide diagnostic context if template syntax is detected
    if (displayName.includes('<%') || displayName.includes('{{')) {
      response.warning = 'Template-like syntax detected in your display name';
      response.hint = 'Display names are used in email templates. To test, trigger an order confirmation email.';
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
