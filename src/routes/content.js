const express = require('express');
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { clearCachePattern } = require('../config/redis');
const { asyncHandler } = require('../middlewares/errorHandler');
const { uploadLocalSingle } = require('../middlewares/upload');

const router = express.Router();

router.post('/upload', authenticateToken, requireRole(['teacher']), uploadLocalSingle, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('description').optional().trim(),
  body('start_time').optional().isISO8601().withMessage('Invalid start time format'),
  body('end_time').optional().isISO8601().withMessage('Invalid end time format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const { title, description, subject, start_time, end_time } = req.body;

  const content = await Content.create(
    title,
    description,
    subject,
    req.file.path,
    req.file.mimetype,
    req.file.size,
    req.user.id,
    start_time ? new Date(start_time) : null,
    end_time ? new Date(end_time) : null
  );

  await clearCachePattern(`live_content_${req.user.id}*`);

  res.status(201).json({
    message: 'Content uploaded successfully',
    content: {
      id: content.id,
      title: content.title,
      subject: content.subject,
      status: content.status,
      created_at: content.created_at
    }
  });
}));

router.get('/my-content', authenticateToken, requireRole(['teacher']), asyncHandler(async (req, res) => {
  const content = await Content.findByTeacher(req.user.id);
  res.json({ content });
}));

router.get('/pending', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const content = await Content.findByStatus('pending');
  res.json({ content });
}));

router.get('/all', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const content = await Content.getAll();
  res.json({ content });
}));

router.post('/approve/:id', authenticateToken, requireRole(['principal']), asyncHandler(async (req, res) => {
  const contentId = req.params.id;
  
  const content = await Content.findById(contentId);
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  if (content.status !== 'pending' && content.status !== 'uploaded') {
    return res.status(400).json({ error: 'Content cannot be approved' });
  }

  const updatedContent = await Content.updateStatus(contentId, 'approved', req.user.id);
  
  await clearCachePattern(`live_content_${content.uploaded_by}*`);
  
  res.json({
    message: 'Content approved successfully',
    content: updatedContent
  });
}));

router.post('/reject/:id', authenticateToken, requireRole(['principal']), [
  body('rejection_reason').trim().isLength({ min: 1 }).withMessage('Rejection reason is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const contentId = req.params.id;
  const { rejection_reason } = req.body;
  
  const content = await Content.findById(contentId);
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  if (content.status !== 'pending' && content.status !== 'uploaded') {
    return res.status(400).json({ error: 'Content cannot be rejected' });
  }

  const updatedContent = await Content.updateStatus(contentId, 'rejected', null, rejection_reason);
  
  await clearCachePattern(`live_content_${content.uploaded_by}*`);
  
  res.json({
    message: 'Content rejected successfully',
    content: updatedContent
  });
}));

router.get('/subjects', authenticateToken, asyncHandler(async (req, res) => {
  const subjects = await Content.getSubjects();
  res.json({ subjects });
}));

module.exports = router;
