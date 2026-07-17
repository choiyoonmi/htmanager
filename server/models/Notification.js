const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework' },
  type: {
    type: String,
    enum: ['due_soon', 'overdue', 'new_homework', 'new_comment', 'submitted'],
    required: true
  },
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
