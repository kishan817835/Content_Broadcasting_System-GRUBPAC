const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/teachers', authenticateToken, requireRole(['principal']), async (req, res) => {
  try {
    const teachers = await User.getTeachers();
    res.json({ teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to get teachers' });
  }
});

router.get('/all', authenticateToken, requireRole(['principal']), async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;
