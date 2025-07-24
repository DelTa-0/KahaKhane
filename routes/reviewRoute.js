const express = require('express');
const router = express.Router();
const reviewModel = require('../models/review-model');
const userModel = require('../models/user-model');
const verifyJWT = require('../middlewares/verifyJWT');
const isLoggedin = require('../middlewares/isLoggedin');
const axios = require('axios');
const restaurantModel = require('../models/restaurant-model');

const { predict_naive_bayes, tokenize } = require('../algorithm/naiveBayes'); // Import your Naive Bayes model


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






// Make sure path is correct

router.post('/',verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { restaurant_id, food_name, review, order_id } = req.body;

    if (!restaurant_id || !food_name || !review || !order_id) {
      req.flash('error_msg', 'Missing required fields.');
      return res.redirect('/profile');
    }

    // ✅ Verify user and order
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

    // ✅ Check if review already exists
    const existingReview = await reviewModel.findOne({
      user_id: userId,
      order_id,
      food_name
    });
    if (existingReview) {
      req.flash('error_msg', 'You have already reviewed this item for this order.');
      return res.redirect('/profile');
    }

    // ✅ Predict sentiment using Naive Bayes
    const cleanedReview = tokenize(review); // Tokenize the review text
    const sentimentScore = predict_naive_bayes(cleanedReview); // Get the sentiment (1 for positive, 0 for negative)

    // ✅ Create review with sentiment_score
    await reviewModel.create({
      user_id: userId,
      restaurant_id,
      order_id,
      food_name,
      review,
      sentiment_score: sentimentScore
    });

    req.flash('success_msg', `Review for ${food_name} submitted! Sentiment: ${sentimentScore === 1 ? 'Positive' : 'Negative'}`);
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not submit review.');
    res.redirect('/profile');
  }
});






module.exports = router;
