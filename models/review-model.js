// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  food_name: { type: String, required: true }, 
  review: { type: String, required: true },
  sentiment_score: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
