const express = require('express');
const StudentEnrollment = require('../models/StudentEnrollment');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { academyId } = req.body;

    let enrollment = await StudentEnrollment.findOne({
      academy: academyId,
      student: req.user.id
    });

    if (enrollment) {
      enrollment.status = 'active';
      await enrollment.save();
    } else {
      enrollment = new StudentEnrollment({
        academy: academyId,
        student: req.user.id,
        status: 'active'
      });
      await enrollment.save();

      const user = await User.findById(req.user.id);
      if (!user.academies.includes(academyId)) {
        user.academies.push(academyId);
        await user.save();
      }
    }

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-academies', auth, async (req, res) => {
  try {
    const enrollments = await StudentEnrollment.find({
      student: req.user.id,
      status: 'active'
    }).populate('academy');

    res.json(enrollments.map(e => e.academy));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:enrollmentId', auth, async (req, res) => {
  try {
    const enrollment = await StudentEnrollment.findById(req.params.enrollmentId);

    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    enrollment.status = 'inactive';
    await enrollment.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
