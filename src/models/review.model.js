// models/review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    foodName: {
      type: String,
      required: false,
    },
    review: { type: String, required: true },
    sentimentScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
