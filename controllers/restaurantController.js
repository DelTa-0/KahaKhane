const restaurantModel = require('../models/restaurant-model');
const reviewModel = require('../models/review-model');
const userModel = require('../models/user-model');
const { buildRecommendations } = require('../algorithm/recommender');  // Import the recommender

const geocode = require('../utils/geocode'); 


module.exports.getRestaurants = async (req, res) => {
  try {
    const { query, price, lat, lng, maxDistance, minSentiment } = req.query;
    const searchTermRaw = req.query.search || '';
    const searchTerm = searchTermRaw.trim().toLowerCase();

    // ✅ Fetch data
    const allRestaurants = await restaurantModel.find().lean();
    const allReviews = await reviewModel.find().lean();


    // ✅ Build a fake user object with location
    const user = {
      location: lat && lng ? { coordinates: [parseFloat(lng), parseFloat(lat)] } : null,
      orders: [] // include order history if you have it
    };

    // ✅ Run recommender
    const recommendations = buildRecommendations({
      restaurants: allRestaurants,
      user,
      reviews: allReviews
    });

    // ✅ Apply text filter
    let filtered = recommendations;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(r =>
        (r.restaurant.name?.toLowerCase().includes(q)) ||
        (r.restaurant.menu || []).some(item => item.name?.toLowerCase().includes(q))
      );
    }

    // ✅ Apply price filter
    if (price) {
      const p = parseFloat(price);
      filtered = filtered.filter(r =>
        (r.restaurant.menu || []).some(item => item.price <= p)
      );
    }

    // ✅ Apply distance filter
    if (maxDistance) {
      const maxD = parseFloat(maxDistance);
      filtered = filtered.filter(r =>
        typeof r.distanceKm === 'number' && r.distanceKm <= maxD
      );
    }

    // ✅ Apply sentiment filter
    if (minSentiment) {
      const minS = parseFloat(minSentiment); // e.g. 0.4
      filtered = filtered.filter(r =>
        typeof r.sentimentScore === 'number' && r.sentimentScore >= minS
      );
    }

    // ✅ Limit to top 10 by finalScore
    const top10 = filtered.slice(0, 10);
  

    res.render('recommendations', {
      recommendations: top10,
      searchTerm,
      query: searchTermRaw,
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
      return res.redirect('/restaurant/browse');
    }

    // Get the search term passed from index page
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
      menu = [...matches, ...nonMatches];
    }

    const reviews = await reviewModel.find({ restaurant: req.params.restaurant_id });

    res.render('restaurant', {
      restaurant: { ...restaurant, menu },
      searchTerm,
      reviews,
      query: searchTermRaw,
      noMatch: searchTerm ? matches.length === 0 : false
    });

  } catch (err) {
    console.error('Error in getDetails:', err);
    req.flash('error_msg', 'Unable to load restaurant details.');
    res.redirect('/restaurant/browse');
  }
};





