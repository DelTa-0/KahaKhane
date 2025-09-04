const express = require('express');
const { addReview, getReviews } = require('../controllers/review.controller')
const router = express.Router();


router.post('/', addReview);
router.post('/:restaurantId/:foodName', getReviews);

module.exports = router;
