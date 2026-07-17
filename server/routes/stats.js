const express = require('express');
const Homework = require('../models/Homework');
const StudentEnrollment = require('../models/StudentEnrollment');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/academy/:academyId', auth, async (req, res) => {
  try {
    const homeworks = await Homework.find({ academy: req.params.academyId })
      .populate('teacher')
      .populate('submittedBy');

    const enrollments = await StudentEnrollment.find({
      academy: req.params.academyId,
      status: 'active'
    }).populate('student');

    const students = enrollments.map(e => e.student);
    const totalHomeworks = homeworks.length;
    const completedHomeworks = homeworks.filter(hw => hw.submittedBy.length > 0).length;
    const completionRate = totalHomeworks > 0 ? Math.round((completedHomeworks / totalHomeworks) * 100) : 0;

    const studentStats = students.map(student => {
      const studentHomeworks = homeworks.filter(hw =>
        hw.submittedBy.some(s => s._id.toString() === student._id.toString())
      );
      return {
        student: { name: student.name, _id: student._id },
        completed: studentHomeworks.length,
        total: totalHomeworks,
        rate: totalHomeworks > 0 ? Math.round((studentHomeworks.length / totalHomeworks) * 100) : 0
      };
    });

    const subjectStats = {};
    homeworks.forEach(hw => {
      if (!subjectStats[hw.subject]) {
        subjectStats[hw.subject] = { total: 0, completed: 0 };
      }
      subjectStats[hw.subject].total++;
      if (hw.submittedBy.length > 0) {
        subjectStats[hw.subject].completed++;
      }
    });

    res.json({
      totalHomeworks,
      completedHomeworks,
      completionRate,
      studentStats,
      subjectStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/personal', auth, async (req, res) => {
  try {
    const homeworks = await Homework.find({}).populate('submittedBy');
    const user = req.user;

    const completed = homeworks.filter(hw =>
      hw.submittedBy.some(s => s._id.toString() === user.id)
    ).length;

    const pending = homeworks.filter(hw =>
      !hw.submittedBy.some(s => s._id.toString() === user.id) &&
      new Date(hw.dueDate) > new Date()
    ).length;

    const overdue = homeworks.filter(hw =>
      !hw.submittedBy.some(s => s._id.toString() === user.id) &&
      new Date(hw.dueDate) <= new Date()
    ).length;

    const total = completed + pending + overdue;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      completed,
      pending,
      overdue,
      total,
      completionRate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
