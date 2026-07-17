const mongoose = require('mongoose');

const textbookOrderSchema = new mongoose.Schema({
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['class', 'individual'], required: true },
  items: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    textbook: { type: mongoose.Schema.Types.ObjectId, ref: 'Textbook', required: true }
  }],
  memo: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TextbookOrder', textbookOrderSchema);
