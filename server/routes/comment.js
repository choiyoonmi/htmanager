const express = require('express');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Homework = require('../models/Homework');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/homework/:homeworkId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const user = req.user;

    const homework = await Homework.findById(req.params.homeworkId).populate('teacher');
    if (!homework) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    const comment = new Comment({
      homework: req.params.homeworkId,
      author: user.id,
      content,
      isTeacherFeedback: user.role === 'teacher'
    });

    await comment.save();
    await comment.populate('author');

    if (user.role === 'teacher') {
      for (const studentId of homework.submittedBy) {
        if (studentId.toString() !== user.id) {
          const notification = new Notification({
            user: studentId,
            homework: req.params.homeworkId,
            type: 'new_comment',
            message: `${user.name} 선생님이 피드백을 남겼습니다`
          });
          await notification.save();
        }
      }
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/homework/:homeworkId/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ homework: req.params.homeworkId })
      .populate('author')
      .populate('attachments')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/comment/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();
    await comment.populate('author');

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/comment/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Comment.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
