const express = require('express');
const LearningHistory = require('../models/LearningHistory');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/check', auth, async (req, res) => {
  try {
    const studentIds = (req.query.studentIds || '').split(',').filter(Boolean);
    const textbookIds = (req.query.textbookIds || '').split(',').filter(Boolean);

    const existing = await LearningHistory.find({
      student: { $in: studentIds },
      textbook: { $in: textbookIds }
    });

    res.json(existing.map(h => ({
      studentId: h.student.toString(),
      textbookId: h.textbook.toString()
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const history = await LearningHistory.find({ student: req.params.studentId })
      .populate('textbook');

    const bySubject = {};
    history.forEach(h => {
      if (!h.textbook) return;
      if (!bySubject[h.subject]) bySubject[h.subject] = [];
      bySubject[h.subject].push({
        textbookId: h.textbook._id,
        name: h.textbook.name,
        seriesName: h.textbook.seriesName,
        order: h.textbook.order,
        completedAt: h.completedAt
      });
    });

    Object.keys(bySubject).forEach(subject => {
      bySubject[subject].sort((a, b) => a.order - b.order);
    });

    res.json(bySubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
