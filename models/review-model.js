// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurant_id: { type: String, required: true },
  review: { type: String, required: true },
  sentiment_score: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
