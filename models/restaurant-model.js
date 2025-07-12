// models/restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurant_id: { type: String, required: true, unique: true },
  'Restaurant Name': { type: String, required: true },
  lat: Number,
  lng: Number,
  menu: {
    type:Array,

  }, // or Array
  Location: String,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
