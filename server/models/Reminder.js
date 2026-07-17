const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reminderTime: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  type: { type: String, enum: ['email', 'in_app'], default: 'in_app' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
