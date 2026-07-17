const express = require('express');
const File = require('../models/File');
const Homework = require('../models/Homework');
const Comment = require('../models/Comment');
const fileUpload = require('../middleware/fileUpload');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/homework/:homeworkId/upload', auth, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = new File({
      homework: req.params.homeworkId,
      uploader: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });

    await file.save();

    const homework = await Homework.findById(req.params.homeworkId);
    if (!homework.attachments) homework.attachments = [];
    homework.attachments.push(file._id);
    await homework.save();

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/comment/:commentId/upload', auth, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = new File({
      comment: req.params.commentId,
      uploader: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });

    await file.save();

    const comment = await Comment.findById(req.params.commentId);
    if (!comment.attachments) comment.attachments = [];
    comment.attachments.push(file._id);
    await comment.save();

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (file.uploader.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const filePath = path.join(__dirname, '..', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', file.url);
    res.download(filePath, file.originalName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
