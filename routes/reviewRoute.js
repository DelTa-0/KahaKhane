const express = require('express');
const router = express.Router();
const reviewModel = require('../models/review-model');
const userModel = require('../models/user-model');
const verifyJWT = require('../middlewares/verifyJWT');
const isLoggedin = require('../middlewares/isLoggedin');

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
  try {
    const userId = req.user.id || req.user._id;
    const { restaurant_id, food_name, review, order_id } = req.body;

    // validate
    if (!restaurant_id || !food_name || !review || !order_id) {
      req.flash('error_msg', 'Missing required fields.');
      return res.redirect('/profile');
    }

    // verify that this order belongs to this user and contains this item
    const user = await userModel.findById(userId).lean();
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/profile');
    }

    let hasOrdered = false;
    (user.orders || []).forEach(order => {
      if (String(order._id) === String(order_id)) {
        order.items.forEach(item => {
          if (
            String(item.restaurant) === String(restaurant_id) &&
            item.food.name === food_name &&
            item.status === 'completed'
          ) {
            hasOrdered = true;
          }
        });
      }
    });

    if (!hasOrdered) {
      req.flash('error_msg', 'You cannot review an item you have not ordered.');
      return res.redirect('/profile');
    }

    // ✅ Check if review already exists for this specific order and item
    const existingReview = await reviewModel.findOne({
      user_id: userId,
      order_id,
      food_name
    });
    if (existingReview) {
      req.flash('error_msg', 'You have already reviewed this item for this order.');
      return res.redirect('/profile');
    }

    // ✅ Create review
    await reviewModel.create({
      user_id: userId,
      restaurant_id,
      order_id,
      food_name,
      review
    });

    req.flash('success_msg', `Review for ${food_name} submitted!`);
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not submit review.');
    res.redirect('/profile');
  }
});

module.exports = router;
