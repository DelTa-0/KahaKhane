// models/restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

  menu: [
    {
      name: String,
      price: Number
    }
  ],
  picture: {
    type: String,
    required: true
  },
  address: { type: String }
});

// Important: add geospatial index
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
