// models/restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurant_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  menu: {
    type:Array,

  }, // or Array
  location: String,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
