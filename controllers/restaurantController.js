const restaurantModel = require('../models/restaurant-model');

module.exports.getRestaurants = async function (req, res) {
  try {
    const restaurants = await restaurantModel.find({});
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};