const mongoose = require('mongoose');

const blogViewLogSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  ip: { type: String, required: true },
  lastViewed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlogViewLog', blogViewLogSchema);
