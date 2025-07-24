// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false },
  order_id: { type: mongoose.Schema.Types.ObjectId, required: false }, 
  food_name: { type: String, required: false }, 
  review: { type: String, required: true },
  sentiment_score: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
