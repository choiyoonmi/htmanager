const mongoose = require('mongoose');

const learningHistorySchema = new mongoose.Schema({
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  textbook: { type: mongoose.Schema.Types.ObjectId, ref: 'Textbook', required: true },
  subject: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  sourceOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'TextbookOrder' }
});

learningHistorySchema.index({ student: 1, textbook: 1 }, { unique: true });

module.exports = mongoose.model('LearningHistory', learningHistorySchema);
