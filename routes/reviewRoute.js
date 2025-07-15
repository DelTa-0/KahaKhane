const express = require('express');
const router = express.Router();
const reviewModel = require('../models/review-model');
const userModel = require('../models/user-model');
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



// POST /review
router.post('/', verifyJWT, async (req, res) => {
  console.log("here")
  const { restaurant_id, review } = req.body;
  const user_id = req.user.id;

  try {
    const user = await userModel.findById(user_id);

    const hasOrdered = user.orders.some(order =>
      order.items?.some(item => item.restaurant?.toString() === restaurant_id)
    );

    if (!hasOrdered) {
      req.flash('error', 'You can only review restaurants you have ordered from.');
      return res.redirect('/restaurant/search');
    }

    await reviewModel.create({
      restaurant_id,
      user_id,
      review,
      sentiment_score: 0, // You can plug in sentiment score calculation here
    });

    req.flash('success_msg', 'Review submitted!');
    res.redirect('/restaurant/search');
  } catch (err) {
    console.error('Review Error:', err);
    req.flash('error', 'Something went wrong while submitting review.');
    res.redirect('/restaurant/search');
  }
});

module.exports = router;
