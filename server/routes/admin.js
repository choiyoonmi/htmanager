const express = require('express');
const User = require('../models/User');
const Academy = require('../models/Academy');
const StudentEnrollment = require('../models/StudentEnrollment');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create-students', auth, async (req, res) => {
  try {
    const { academyId, students } = req.body;

    const academy = await Academy.findById(academyId);
    if (!academy || academy.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: '권한 없음' });
    }

    const createdStudents = [];

    for (const studentData of students) {
      try {
        let user = await User.findOne({ accessCode: studentData.accessCode });

        if (!user) {
          user = new User({
            name: studentData.name,
            accessCode: studentData.accessCode,
            role: 'student'
          });
          await user.save();
        }

        let enrollment = await StudentEnrollment.findOne({
          academy: academyId,
          student: user._id
        });

        if (!enrollment) {
          enrollment = new StudentEnrollment({
            academy: academyId,
            student: user._id,
            status: 'active'
          });
          await enrollment.save();

          if (!academy.students.includes(user._id)) {
            academy.students.push(user._id);
          }
        }

        createdStudents.push({
          id: user._id,
          name: user.name,
          accessCode: user.accessCode
        });
      } catch (err) {
        console.error(`Failed to create student ${studentData.accessCode}:`, err.message);
      }
    }

    await academy.save();

    res.json({
      success: true,
      created: createdStudents.length,
      students: createdStudents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academy/:academyId/students', auth, async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.academyId);

    if (!academy || academy.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: '권한 없음' });
    }

    const enrollments = await StudentEnrollment.find({
      academy: req.params.academyId,
      status: 'active'
    }).populate('student');

    const students = enrollments.map(e => ({
      enrollmentId: e._id,
      id: e.student._id,
      name: e.student.name,
      accessCode: e.student.accessCode,
      enrolledAt: e.enrolledAt
    }));

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
