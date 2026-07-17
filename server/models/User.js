const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  accessCode: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'parent', 'teacher'], default: 'student' },
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy' },
  academies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Academy' }],
  profileImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
