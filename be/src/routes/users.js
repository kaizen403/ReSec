const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

// Get user profile - INTENTIONALLY VULNERABLE TO IDOR
router.get('/user/:userId', async (req, res) => {
  try {
    // VULNERABILITY: No authorization check - any user can view any profile
    const userId = parseInt(req.params.userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        secretNote: true, // FLAG: Admin user has flag in secretNote
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile - INTENTIONALLY VULNERABLE TO MASS ASSIGNMENT
router.put('/user/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // VULNERABILITY: Accepts any field from request body without filtering
    // User can escalate privileges by passing { role: 'admin' }
    const { displayName, email, username, role } = req.body;
    
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) {
      // FLAG: Admin role grants access to admin-only endpoints
      updateData.role = role;
      // Update session role if changed
      req.session.role = role;
    }
    
    const user = await prisma.user.update({
      where: { id: req.session.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true
      }
    });
    
    // If user escalated to admin, reveal the flag
    if (user.role === 'admin') {
      return res.json({
        ...user,
        message: 'Profile updated successfully',
        admin_panel: '/api/v1/admin/dashboard',
        flag: process.env.MASS_ASSIGNMENT_FLAG || 'PCTFS{mass_assignment_privilege_escalation}'
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




