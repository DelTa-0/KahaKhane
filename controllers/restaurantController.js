const restaurantModel = require('../models/restaurant-model');

module.exports.getRestaurants = async function (req, res) {
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

module.exports.getDetails = async function (req, res) {
   try {
    const {restaurant_id}=req.params;
    let restaurant=await restaurantModel.findOne({_id:restaurant_id});
    
    res.render('restaurant',{restaurant});
    
  } catch (err) {
    console.error(err.message);
    
  }
};