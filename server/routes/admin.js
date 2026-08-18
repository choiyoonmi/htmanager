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
            grade: studentData.grade || '',
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
          accessCode: user.accessCode,
          grade: user.grade || ''
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
      grade: e.student.grade || '',
      enrolledAt: e.enrolledAt
    }));

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/academy/:academyId/students/:studentId', auth, async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.academyId);
    if (!academy || academy.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: '권한 없음' });
    }

    const enrollment = await StudentEnrollment.findOne({
      academy: req.params.academyId,
      student: req.params.studentId,
      status: 'active'
    });
    if (!enrollment) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
    }

    const name = String(req.body.name || '').trim();
    const grade = String(req.body.grade || '').trim();
    const accessCode = String(req.body.accessCode || '').trim();
    if (!name || !grade || !accessCode) {
      return res.status(400).json({ error: '이름, 학년, 접속번호를 모두 입력해주세요' });
    }

    const duplicate = await User.findOne({
      accessCode,
      _id: { $ne: req.params.studentId }
    });
    if (duplicate) {
      return res.status(409).json({ error: '이미 사용 중인 접속번호입니다' });
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.studentId, role: 'student' },
      { name, grade, accessCode },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
    }

    res.json({
      id: student._id,
      name: student.name,
      grade: student.grade || '',
      accessCode: student.accessCode
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: '이미 사용 중인 접속번호입니다' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
