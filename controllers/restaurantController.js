const restaurantModel = require('../models/restaurant-model');
const reviewModel = require('../models/review-model');

const geocode = require('../utils/geocode'); 

 

module.exports.getRestaurants = async function (req, res) {
  try {
    const perPage = 12;
    const page = Number(req.query.page) || 1;

    const { query, location, lat, lng, price } = req.query;
    let filter = {};

    // Filter by item name (query) or menu item
    if (query && query.trim() !== '') {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { 'menu.name': { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by price
    if (price && !isNaN(price)) {
      filter['menu.price'] = { $lte: parseFloat(price) };
    }

    let latVal = lat && lat.trim() !== '' ? parseFloat(lat) : null;
    let lngVal = lng && lng.trim() !== '' ? parseFloat(lng) : null;

    // If no lat/lng, try geocoding the location (like "baudha")
    if (!latVal && !lngVal && location && location.trim() !== '') {
      const geo = await geocode(location); // Use your geocode function here
      if (geo) {
        latVal = geo.lat;
        lngVal = geo.lng;
        
      }
    }
    
    // Check if we have valid lat/lng
    if (latVal && lngVal) {
      // MongoDB aggregation query with $geoNear for sorting by distance
      const restaurants = await restaurantModel.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lngVal, latVal] // [longitude, latitude]
            },
            distanceField: 'distance', // Adds a field 'distance' with the calculated distance
            maxDistance: 5000, // Optional: limit search within 5km (in meters)
            spherical: true // Use spherical calculation for distance
          }
        },
        {
          $match: filter // Apply other filters (name, price, etc.)
        },
        {
          $skip: (perPage * page) - perPage // Pagination: Skip based on current page
        },
        {
          $limit: perPage // Limit to the number of items per page
        }
      ]);

      // Get the total count of matching restaurants (for pagination)
      const totalRestaurants = await restaurantModel.countDocuments(filter);
      const totalPages = Math.ceil(totalRestaurants / perPage);

      // Send the response
      res.render('browse', {
        restaurants,
        currentPage: page,
        totalPages,
        latVal,
        lngVal
      });
    } else {
      res.status(400).send('Invalid location data');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching restaurants');
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
      req.flash('error', 'Restaurant not found.');
      return res.redirect('/restaurant/browse');
    }

    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';

    let menu = restaurant.menu || [];
    if (searchTerm) {
      const matches = menu.filter(item =>
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
      query
    });
  } catch (err) {
    console.error('Error in getDetails:', err);
    req.flash('error', 'Unable to load restaurant details.');
    res.redirect('/restaurant/browse');
  }
};




