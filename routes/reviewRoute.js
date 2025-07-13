
const express = require('express');
const router = express.Router();
const reviewModel = require('../models/review-model');
const userModel = require('../models/user-model');
const verifyJWT = require('../middlewares/verifyJWT');


router.get('/:restaurant_id', verifyJWT, async (req, res) => {
  const { restaurant_id } = req.params;
  const user = await userModel.findById(req.user.id);

  const hasOrdered = user.orders.some(order =>
    order.items.some(item => item.restaurant.toString() === restaurant_id)
  );

  if (!hasOrdered) {
    req.flash('error_msg', 'You can only review restaurants you have ordered from.');
    return res.redirect('/restaurants');
  }

  res.render('review', { restaurant_id });
});

router.post('/', verifyJWT, async (req, res) => {
  const { restaurant_id, review } = req.body;
  const sentiment_score = analyzeSentiment(review); // or 0
  const user = await userModel.findById(req.user.id);

  const hasOrdered = user.orders.some(order =>
    order.items.some(item => item.restaurant.toString() === restaurant_id)
  );

  if (!hasOrdered) {
    req.flash('error_msg', 'You cannot review without ordering.');
    return res.redirect('/');
  }

  const alreadyReviewed = await reviewModel.findOne({ restaurant_id, user_email: user.email });
  if (alreadyReviewed) {
    req.flash('error_msg', 'You have already reviewed this restaurant.');
    return res.redirect('/');
  }

  await Review.create({
    restaurant_id,
    user_email: user.email,
    review,
    sentiment_score
  });

  req.flash('success_msg', 'Thank you for your review!');
  res.redirect(`/details/${restaurant_id}`);
});

module.exports = router;
