const express = require('express');
const { getRestaurants, getDetails, getAllRestaurants, getRecommendation } = require('../controllers/restaurant.controller');
const { getReviews } = require('../controllers/review.controller');
const isLoggedin = require('../middlewares/auth.middleware.js');
const router=express.Router();

router.get('/details/:restaurantId',getDetails);
router.get('/browse',getAllRestaurants);
router.get('/reviews',getReviews);
router.get('/recommendations',isLoggedin,getRestaurants);

module.exports=router;