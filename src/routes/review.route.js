const express = require('express');
const { addReview } = require('../controllers/review.controller')
const router = express.Router();
const reviewModel = require('../models/review.model');
const verifyJWT = require('../middlewares/verifyJWT');


router.post('/:restaurant_id/:food_name', async (req, res) => {
  const { restaurant_id, food_name } = req.params;
  const { review, rating } = req.body;

  await reviewModel.create({
    restaurant_id,
    food_name,
    review,
    sentiment_score: parseFloat(rating), // or run sentiment analysis
    user_id: req.user._id
  });

  res.redirect('/profile');
});

router.post('/',verifyJWT, addReview);

module.exports = router;
