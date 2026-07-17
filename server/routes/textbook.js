const express = require('express');
const Textbook = require('../models/Textbook');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { academy, subject, seriesName, name, order } = req.body;
    const textbook = new Textbook({ academy, subject, seriesName, name, order });
    await textbook.save();
    res.json(textbook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academy/:academyId', auth, async (req, res) => {
  try {
    const filter = { academy: req.params.academyId };
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }
    const textbooks = await Textbook.find(filter).sort({ subject: 1, seriesName: 1, order: 1 });
    res.json(textbooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { subject, seriesName, name, order } = req.body;
    const updated = await Textbook.findByIdAndUpdate(
      req.params.id,
      { subject, seriesName, name, order },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Textbook.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
