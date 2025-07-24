const express = require('express');
const { getRestaurants, getDetails, getAllRestaurants, getRecommendation } = require('../controllers/restaurantController');
const { getReviews } = require('../controllers/reviewController');
const restaurantModel = require('../models/restaurant-model');
const verifyJWT = require('../middlewares/verifyJWT');

const router=express.Router();

// router.get('/search',getRestaurants);

router.get('/details/:restaurant_id',getDetails);

router.get('/browse',getAllRestaurants);


router.get('/reviews',getReviews);

router.get('/recommendations',verifyJWT,getRecommendation);


module.exports=router;