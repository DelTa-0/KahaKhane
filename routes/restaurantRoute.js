const express = require('express');
const { getRestaurants, getDetails } = require('../controllers/restaurantController');
const { getReviews } = require('../controllers/reviewController');
const restaurantModel = require('../models/restaurant-model');

const router=express.Router();

router.get('/search',getRestaurants);

router.get('/details/:restaurant_id',getDetails);


router.get('/reviews',getReviews);

module.exports=router;