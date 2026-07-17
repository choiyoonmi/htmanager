const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema({
  academy: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

studentEnrollmentSchema.index({ academy: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
