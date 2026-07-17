const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
