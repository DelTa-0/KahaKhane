const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../config/app.config");

const orderItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  food: {
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  quantity: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.CANCELLED,
    ],
    default: ORDER_STATUS.PENDING,
  },
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  instructions: { type: String },
  orderedAt: { type: Date, default: Date.now },
});

const userSchema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  cart: [orderItemSchema],
  orders: [orderSchema],
  contact: Number,
  picture: Buffer,
});

module.exports = mongoose.model("User", userSchema);
