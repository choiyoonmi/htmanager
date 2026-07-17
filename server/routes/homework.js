const express = require('express');
const Homework = require('../models/Homework');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, academy, dueDate, priority, assignedTo } = req.body;
    const homework = new Homework({
      title,
      description,
      subject,
      academy,
      dueDate,
      priority,
      teacher: req.user.id,
      assignedTo: assignedTo || []
    });
    await homework.save();
    res.json(homework);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academy/:academyId', auth, async (req, res) => {
  try {
    const homeworks = await Homework.find({ academy: req.params.academyId })
      .populate('teacher')
      .populate('submittedBy');
    res.json(homeworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(homework);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework.submittedBy.includes(req.user.id)) {
      homework.submittedBy.push(req.user.id);
      if (homework.submittedBy.length > 0) {
        homework.status = 'completed';
      }
    }
    await homework.save();
    res.json(homework);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ error: '숙제를 찾을 수 없습니다' });
    }

    // 선생님만 삭제 가능
    const teacherId = homework.teacher?.toString() || homework.teacher;
    const userId = req.user.id?.toString() || req.user.id;

    if (teacherId !== userId) {
      console.log('Delete denied:', { teacherId, userId });
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    // studentId가 있으면 해당 학생만 제거, 없으면 전체 숙제 삭제
    const studentId = req.query.studentId;

    if (studentId) {
      // 학생을 assignedTo에서 제거
      homework.assignedTo = homework.assignedTo.filter(id => id.toString() !== studentId);
      await homework.save();
      res.json({ success: true, message: '숙제가 제거되었습니다' });
    } else {
      // 전체 숙제 삭제
      await Homework.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: '숙제가 삭제되었습니다' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
