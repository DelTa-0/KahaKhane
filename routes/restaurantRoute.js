const express = require('express');
const { getRestaurants } = require('../controllers/restaurantController');
const { getReviews } = require('../controllers/reviewController');

const router=express.Router();

router.get('/search',getRestaurants);

router.get('/reviews',getReviews);

module.exports=router;