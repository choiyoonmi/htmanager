const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { accessCode } = req.body;

    const user = await User.findOne({ accessCode });
    if (!user) {
      return res.status(401).json({ error: '잘못된 접속번호입니다' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-teacher', async (req, res) => {
  try {
    const { name, accessCode } = req.body;

    if (!name || !accessCode) {
      return res.status(400).json({ error: '이름과 접속번호를 입력해주세요' });
    }

    let user = await User.findOne({ accessCode });
    if (user) {
      return res.status(400).json({ error: '이미 존재하는 접속번호입니다' });
    }

    user = new User({
      name,
      accessCode,
      role: 'teacher'
    });

    await user.save();

    res.json({
      success: true,
      message: '선생님 계정이 생성되었습니다',
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
