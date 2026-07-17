const express = require('express');
const TextbookOrder = require('../models/TextbookOrder');
const LearningHistory = require('../models/LearningHistory');
const Class = require('../models/Class');
const Textbook = require('../models/Textbook');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { academy, classId, studentIds, textbookIds, memo } = req.body;

    let targetType = 'individual';
    let students = studentIds || [];

    if (classId) {
      const cls = await Class.findById(classId);
      if (!cls) {
        return res.status(404).json({ error: '반을 찾을 수 없습니다' });
      }
      targetType = 'class';
      students = cls.students.map(s => s.toString());
    }

    const textbooks = await Textbook.find({ _id: { $in: textbookIds } });

    const alreadyCompleted = await LearningHistory.find({
      student: { $in: students },
      textbook: { $in: textbookIds }
    });
    const completedSet = new Set(
      alreadyCompleted.map(h => `${h.student.toString()}_${h.textbook.toString()}`)
    );

    const items = [];
    const skipped = [];

    for (const studentId of students) {
      for (const textbook of textbooks) {
        const key = `${studentId}_${textbook._id.toString()}`;
        if (completedSet.has(key)) {
          skipped.push({ studentId, textbookId: textbook._id, textbookName: textbook.name });
        } else {
          items.push({ student: studentId, textbook: textbook._id });
        }
      }
    }

    const order = new TextbookOrder({
      academy,
      class: classId || null,
      teacher: req.user.id,
      targetType,
      items,
      memo
    });
    await order.save();

    if (items.length > 0) {
      const textbookMap = new Map(textbooks.map(t => [t._id.toString(), t]));
      await LearningHistory.insertMany(
        items.map(item => ({
          academy,
          student: item.student,
          textbook: item.textbook,
          subject: textbookMap.get(item.textbook.toString()).subject,
          sourceOrder: order._id
        })),
        { ordered: false }
      );
    }

    const students_ = await User.find({ _id: { $in: [...new Set(skipped.map(s => s.studentId))] } });
    const studentNameMap = new Map(students_.map(s => [s._id.toString(), s.name]));
    const skippedWithNames = skipped.map(s => ({
      ...s,
      studentName: studentNameMap.get(s.studentId.toString()) || ''
    }));

    res.json({
      order,
      createdCount: items.length,
      skipped: skippedWithNames
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academy/:academyId', auth, async (req, res) => {
  try {
    const orders = await TextbookOrder.find({ academy: req.params.academyId })
      .populate('class')
      .populate('teacher')
      .populate('items.student')
      .populate('items.textbook')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
