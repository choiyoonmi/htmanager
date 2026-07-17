const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
  url: String
});

module.exports = mongoose.model('File', fileSchema);
