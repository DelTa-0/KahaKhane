const reviewModel = require('../models/review.model');
const userModel = require('../models/user.model');
const { getSentimentScore } = require('../utils/sentimentClient');

module.exports.getReviews = async (req, res) => {
  const { restaurantId, foodName } = req.params;
  const { review, rating } = req.body;

  // Optionally, use given rating if provided
  const sentimentScore = rating
    ? parseFloat(rating)
    : await getSentimentScore(review);

  await reviewModel.create({
    restaurantId,
    foodName,
    review,
    sentimentScore,
    userId: req.user._id
  });

  res.redirect('/users/profile');
};

module.exports.addReview = async function (req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { restaurantId, foodName, review, orderId } = req.body;

    if (!restaurantId || !foodName || !review || !orderId) {
      req.flash('error_msg', 'Missing required fields.');
      return res.redirect('/users/profile');
    }

    const user = await userModel.findById(userId).lean();
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/users/profile');
    }

    // ✅ Verify user ordered this item
    const hasOrdered = (user.orders || []).some(order =>
      String(order._id) === String(orderId) &&
      order.items.some(item =>
        String(item.restaurant) === String(restaurantId) &&
        item.food.name === foodName &&
        item.status === 'completed'
      )
    );

    if (!hasOrdered) {
      req.flash('error_msg', 'You cannot review an item you have not ordered.');
      return res.redirect('/users/profile');
    }

    // ✅ Prevent duplicate review
    const existingReview = await reviewModel.findOne({ userId, orderId, foodName });
    if (existingReview) {
      req.flash('error_msg', 'You have already reviewed this item for this order.');
      return res.redirect('/users/profile');
    }

    // ✅ Get sentiment score safely
    let sentimentScore = 0.5; // fallback
    try {
      sentimentScore = await getSentimentScore(review);
    } catch (err) {
      console.error("Error fetching sentiment score:", err.message);
    }

    // ✅ Save review
    await reviewModel.create({
      userId,
      restaurantId,
      orderId,
      foodName,
      review,
      sentimentScore
    });

    req.flash(
      'success_msg',
      `Review for ${foodName} submitted! Sentiment Score: ${sentimentScore.toFixed(2)}`
    );
    res.redirect('/users/profile');

  } catch (err) {
    console.error("Failed to add review:", err);
    req.flash('error_msg', 'Could not submit review.');
    res.redirect('/users/profile');
  }
};
