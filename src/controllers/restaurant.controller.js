const restaurantModel = require('../models/restaurant.model');
const reviewModel = require('../models/review.model');
const userModel = require('../models/user.model');
const { buildRecommendations } = require('../../algorithm/recommender');  // Import the recommender

const geocode = require('../utils/geocode'); 

module.exports.getRestaurants = async (req, res) => {
  try {
    let {
      query, // food keyword
      price,
      lat,
      lng,
      maxDistance,
      minSentiment,
      location
    } = req.query;

    const searchTermRaw = query || '';
    const searchTerm = searchTermRaw.trim().toLowerCase();

    let userLocation = null;
  if (lat && lng && lat.trim() !== '' && lng.trim() !== '') {
  userLocation = { coordinates: [parseFloat(lng), parseFloat(lat)] };
  } else if (location && location.trim() !== '') {
  const geo = await geocode(location.trim());
  if (geo && geo.coordinates) {
    userLocation = { coordinates: geo.coordinates };
  }
 lat = geo.coordinates[1]; // latitude
 lng = geo.coordinates[0]; // longitude
 
  }
    const allRestaurants = await restaurantModel.find().lean();
    const allReviews = await reviewModel.find().lean();

    const user = {
      location: userLocation,
      orders: []
    };

    let recommendations = buildRecommendations({
      restaurants: allRestaurants,
      user,
      reviews: allReviews
    });

    if (searchTerm) {
      recommendations = recommendations.filter(r =>
        (r.restaurant.name?.toLowerCase().includes(searchTerm)) ||
        (r.restaurant.menu || []).some(item => item.name?.toLowerCase().includes(searchTerm))
      );
    }

    if (price) {
      const p = parseFloat(price);
      recommendations = recommendations.filter(r =>
        (r.restaurant.menu || []).some(item => item.price <= p)
      );
    }

    if (maxDistance) {
      const maxD = parseFloat(maxDistance);
      recommendations = recommendations.filter(r =>
        typeof r.distanceKm === 'number' && r.distanceKm <= maxD
      );
    }

    if (minSentiment) {
      const minS = parseFloat(minSentiment);
      recommendations = recommendations.filter(r =>
        typeof r.sentimentScore === 'number' && r.sentimentScore >= minS
      );
    }

    const top10 = recommendations.slice(0, 10);

    console.log('lat, lng:', lat, lng);

    res.render('recommendations', {
      recommendations: top10,
      query: searchTermRaw,
      searchTerm,
      lat,
      lng,
      noMatch: searchTerm ? top10.length === 0 : false
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getAllRestaurants = async function (req, res) {
   try {
    const perPage = 12;
    const page = Number(req.query.page) || 1; 
    const restaurants = await restaurantModel.find()
      .skip((perPage * page) - perPage)  // Skip the previous pages
      .limit(perPage);  // Limit the number of restaurants per page
    const totalRestaurants = await restaurantModel.countDocuments();
    const totalPages = Math.ceil(totalRestaurants / perPage);

    res.render('browse', { 
      restaurants, 
      currentPage: page, 
      totalPages 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching restaurants');
  }
};

module.exports.getDetails = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.params.restaurant_id).lean();
    if (!restaurant) {
      req.flash('error_msg', 'Restaurant not found.');
      return res.redirect('/shop');
    }

    const searchTermRaw = req.query.search || '';
    const searchTerm = searchTermRaw.trim().toLowerCase();

    let menu = restaurant.menu || [];
    let matches = [];

    if (searchTerm) {
      matches = menu.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      );
      const nonMatches = menu.filter(item =>
        !item.name.toLowerCase().includes(searchTerm)
      );
      // ✅ Put matched items first
      menu = [...matches, ...nonMatches];
    }

    res.render('restaurant', {
      restaurant: { ...restaurant, menu },
      searchTerm,
      noMatch: searchTerm ? matches.length === 0 : false,
      firstMatch: matches.length > 0 ? matches[0] : null
    });

  } catch (err) {
    console.error('Error in getDetails:', err);
    req.flash('error_msg', 'Unable to load restaurant details.');
    res.redirect('/shop');
  }
};





