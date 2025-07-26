const express = require('express');
const { getRestaurants, getDetails, getAllRestaurants, getRecommendation } = require('../controllers/restaurant.controller');
const { getReviews } = require('../controllers/review.controller');
const verifyJWT = require('../middlewares/verifyJWT');

const router=express.Router();

router.get('/details/:restaurant_id',getDetails);
router.get('/browse',getAllRestaurants);
router.get('/reviews',getReviews);
router.get('/recommendations',verifyJWT,getRestaurants);

module.exports=router;