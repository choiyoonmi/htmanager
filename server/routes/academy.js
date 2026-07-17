const express = require('express');
const User = require('../models/User');
const Academy = require('../models/Academy');
const StudentEnrollment = require('../models/StudentEnrollment');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, subjects } = req.body;
    const academy = new Academy({
      name,
      description,
      subjects,
      owner: req.user.id,
      teachers: [req.user.id]
    });
    await academy.save();

    // Add academy to user's academies array
    const user = await User.findById(req.user.id);
    if (user && !user.academies.includes(academy._id)) {
      user.academies.push(academy._id);
      await user.save();
    }

    res.json(academy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id)
      .populate('owner')
      .populate('students')
      .populate('teachers');
    if (!academy) {
      return res.status(404).json({ error: 'Academy not found' });
    }
    res.json(academy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id);
    if (academy.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(academy, req.body);
    await academy.save();
    res.json(academy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/students', auth, async (req, res) => {
  try {
    const enrollments = await StudentEnrollment.find({
      academy: req.params.id,
      status: 'active'
    }).populate('student');
    res.json(enrollments.map(e => e.student));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const { studentId } = req.body;
    const academy = await Academy.findById(req.params.id);

    if (academy.owner.toString() !== req.user.id && !academy.teachers.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let enrollment = await StudentEnrollment.findOne({
      academy: req.params.id,
      student: studentId
    });

    if (enrollment) {
      enrollment.status = 'active';
      await enrollment.save();
    } else {
      enrollment = new StudentEnrollment({
        academy: req.params.id,
        student: studentId,
        status: 'active'
      });
      await enrollment.save();

      if (!academy.students.includes(studentId)) {
        academy.students.push(studentId);
        await academy.save();
      }
    }

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/enroll/:studentId', auth, async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id);

    if (academy.owner.toString() !== req.user.id && !academy.teachers.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const enrollment = await StudentEnrollment.findOneAndUpdate(
      { academy: req.params.id, student: req.params.studentId },
      { status: 'inactive' },
      { new: true }
    );

    if (enrollment) {
      academy.students = academy.students.filter(s => s.toString() !== req.params.studentId);
      await academy.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
