const express = require('express');
const rateLimit = require('express-rate-limit');
const SchedulingService = require('../services/SchedulingService');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { getCache, setCache } = require('../config/redis');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(publicApiLimiter);

router.get('/live/:teacherId', asyncHandler(async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  
  if (isNaN(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  const cacheKey = `live_content_${teacherId}`;
  let liveContent = await getCache(cacheKey);

  if (!liveContent) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    liveContent = await SchedulingService.getTeacherLiveContent(teacherId);
    
    if (liveContent.id) {
      await Analytics.trackContentView(liveContent.id, teacherId, liveContent.subject);
    }
    
    await setCache(cacheKey, liveContent, 60);
  }

  res.json(liveContent);
}));

router.get('/live/:teacherId/:subject', asyncHandler(async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  const subject = req.params.subject;
  
  if (isNaN(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacher ID' });
  }

  const cacheKey = `live_content_${teacherId}_${subject}`;
  let activeContent = await getCache(cacheKey);

  if (!activeContent) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    activeContent = await SchedulingService.getActiveContent(teacherId, subject);
    
    if (activeContent) {
      await Analytics.trackContentView(activeContent.id, teacherId, subject);
      await setCache(cacheKey, activeContent, 60);
    }
  }
  
  if (!activeContent) {
    return res.json({ message: "No content available" });
  }

  res.json({
    id: activeContent.id,
    title: activeContent.title,
    description: activeContent.description,
    subject: activeContent.subject,
    file_url: activeContent.file_url,
    file_type: activeContent.file_type,
    uploader_name: activeContent.uploader_name
  });
}));

module.exports = router;
