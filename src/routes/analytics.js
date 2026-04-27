const express = require('express');
const Analytics = require('../models/Analytics');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

router.get('/subjects', authenticateToken, requireRole(['principal', 'teacher']), asyncHandler(async (req, res) => {
  const analytics = await Analytics.getSubjectAnalytics();
  res.json({ analytics });
}));

router.get('/teacher/:teacherId', authenticateToken, requireRole(['principal', 'teacher']), asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  
  if (req.user.role === 'teacher' && req.user.id !== parseInt(teacherId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const analytics = await Analytics.getTeacherAnalytics(teacherId);
  res.json({ analytics });
}));

router.get('/top-content', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const topContent = await Analytics.getTopContent(limit);
  res.json({ topContent });
}));

router.get('/most-active-subject', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const mostActive = await Analytics.getMostActiveSubject();
  res.json({ mostActive });
}));

router.get('/daily-views', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const dailyViews = await Analytics.getDailyViews(days);
  res.json({ dailyViews });
}));

module.exports = router;
