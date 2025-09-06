const restaurantModel = require("../models/restaurant.model");
const reviewModel = require("../models/review.model");
const { buildRecommendations } = require("../algorithm/recommender"); // Import the recommender

const geocode = require("../utils/geocode");

module.exports.getRestaurants = async (req, res) => {
  try {
    // Normalize query params
    let { query, price, lat, lng, maxDistance, minSentiment, location } = req.query;
    const searchTerm = (query || "").trim().toLowerCase();
    const maxPrice = price ? parseFloat(price) : null;
    const maxDist = maxDistance ? parseFloat(maxDistance) : null;
    const minSent = minSentiment ? parseFloat(minSentiment) : null;

    // Determine user location (coordinates)
    let userLocation = null;
    if (lat?.trim() && lng?.trim()) {
      userLocation = { coordinates: [parseFloat(lng), parseFloat(lat)] };
    } else if (location?.trim()) {
      const geo = await geocode(location.trim());
      if (geo?.coordinates) {
        userLocation = { coordinates: geo.coordinates };
        lat = geo.coordinates[1];
        lng = geo.coordinates[0];
      }
    }

    // Fetch all restaurants and reviews
    const [allRestaurants, allReviews] = await Promise.all([
      restaurantModel.find().lean(),
      reviewModel.find().lean(),
    ]);

    // Build recommendations
    let recommendations = buildRecommendations({
      restaurants: allRestaurants,
      user: { location: userLocation, orders: [] },
      reviews: allReviews,
    });

    // Helper function for filtering
    const matchesSearch = (r) => {
      if (!searchTerm) return true;
      const nameMatch = r.restaurant.name?.toLowerCase().includes(searchTerm);
      const menuMatch = r.restaurant.menu?.some(item =>
        item.name?.toLowerCase().includes(searchTerm)
      );
      return nameMatch || menuMatch;
    };

    const matchesPrice = (r) => {
      if (maxPrice == null) return true;
      return r.restaurant.menu?.some(item => item.price <= maxPrice);
    };

    const matchesDistance = (r) => {
      if (maxDist == null) return true;
      return typeof r.distanceKm === "number" && r.distanceKm <= maxDist;
    };

    const matchesSentiment = (r) => {
      if (minSent == null) return true;
      return typeof r.sentimentScore === "number" && r.sentimentScore >= minSent;
    };

    //Apply all filters in a single pass
    recommendations = recommendations.filter(r =>
      matchesSearch(r) && matchesPrice(r) && matchesDistance(r) && matchesSentiment(r)
    );

    // Limit to top 10
    const top10 = recommendations.slice(0, 10);

    res.render("recommendations", {
      recommendations: top10,
      query,
      searchTerm,
      lat,
      lng,
      noMatch: searchTerm ? top10.length === 0 : false,
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Something went wrong");
  }
};


module.exports.getAllRestaurants = async function (req, res) {
  try {
    const perPage = 12;
    const page = Number(req.query.page) || 1;
    const restaurants = await restaurantModel
      .find()
      .skip(perPage * page - perPage) // Skip the previous pages
      .limit(perPage); // Limit the number of restaurants per page
    const totalRestaurants = await restaurantModel.countDocuments();
    const totalPages = Math.ceil(totalRestaurants / perPage);

    res.render("browse", {
      restaurants,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching restaurants");
  }
};

module.exports.getDetails = async (req, res) => {
  try {
    const restaurant = await restaurantModel
      .findById(req.params.restaurantId)
      .lean();
    if (!restaurant) {
      req.flash("error_msg", "Restaurant not found.");
      return res.redirect("/shop");
    }

    const searchTermRaw = req.query.search || "";
    const searchTerm = searchTermRaw.trim().toLowerCase();

    let menu = restaurant.menu || [];
    let matches = [];

    if (searchTerm) {
      matches = menu.filter((item) =>
        item.name.toLowerCase().includes(searchTerm)
      );
      const nonMatches = menu.filter(
        (item) => !item.name.toLowerCase().includes(searchTerm)
      );
      // ✅ Put matched items first
      menu = [...matches, ...nonMatches];
    }

    res.render("restaurant", {
      restaurant: { ...restaurant, menu },
      searchTerm,
      noMatch: searchTerm ? matches.length === 0 : false,
      firstMatch: matches.length > 0 ? matches[0] : null,
    });
  } catch (err) {
    console.error("Error in getDetails:", err);
    req.flash("error_msg", "Unable to load restaurant details.");
    res.redirect("/shop");
  }
};
