const express = require('express');
const { addReview } = require('../controllers/review.controller')
const router = express.Router();
const reviewModel = require('../models/review.model');


router.post('/:restaurantId/:foodName', async (req, res) => {
  const { restaurantId, foodName } = req.params;
  const { review, rating } = req.body;

  await reviewModel.create({
    restaurantId,
    foodName,
    review,
    sentiment_score: parseFloat(rating), // or run sentiment analysis
    userId: req.user._id
  });

  res.redirect('/users/profile');
});

router.post('/', addReview);

module.exports = router;
