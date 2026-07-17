const mongoose = require('mongoose');

const textbookSchema = new mongoose.Schema({
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  subject: { type: String, required: true },
  seriesName: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Textbook', textbookSchema);
