// models/restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurant_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  // GeoJSON location field
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  menu: [
    {
      name: String,
      price: Number
    }
  ],

  address: { type: String } // renamed Location to address for clarity
});

// Important: add geospatial index
restaurantSchema.index({ location: '2dsphere' });




module.exports = mongoose.model('Restaurant', restaurantSchema);
