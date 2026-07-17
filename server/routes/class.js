const express = require('express');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { academy, name, subject, students } = req.body;
    const newClass = new Class({
      academy,
      name,
      subject,
      teacher: req.user.id,
      students: students || []
    });
    await newClass.save();
    res.json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academy/:academyId', auth, async (req, res) => {
  try {
    const classes = await Class.find({ academy: req.params.academyId })
      .populate('students')
      .populate('teacher');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, subject, students } = req.body;
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { name, subject, students },
      { new: true }
    ).populate('students');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
