
const { tokenize, predict_naive_bayes } = require('../../algorithm/naiveBayes');
const reviewModel = require('../models/review.model');
const userModel = require('../models/user.model');


module.exports.getReviews=async (req, res) => {
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
};

module.exports.addReview = async function (req,res){
  try {
    const userId = req.user.id || req.user._id;
    const { restaurantId, foodName, review, orderId } = req.body;

    if (!restaurantId || !foodName || !review || !orderId) {
      req.flash('error_msg', 'Missing required fields.');
      return res.redirect('/users/profile');
    }

    // ✅ Verify user and order
    const user = await userModel.findById(userId).lean();
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/users/profile');
    }

    let hasOrdered = false;
    (user.orders || []).forEach(order => {
      if (String(order._id) === String(orderId)) {
        order.items.forEach(item => {
          if (
            String(item.restaurant) === String(restaurantId) &&
            item.food.name === foodName &&
            item.status === 'completed'
          ) {
            hasOrdered = true;
          }
        });
      }
    });

    if (!hasOrdered) {
      req.flash('error_msg', 'You cannot review an item you have not ordered.');
      return res.redirect('/users/profile');
    }

    // ✅ Check if review already exists
    const existingReview = await reviewModel.findOne({
      userId: userId,
      orderId: orderId,
      foodName: foodName
    });

    if (existingReview) {
      req.flash('error_msg', 'You have already reviewed this item for this order.');
      return res.redirect('/users/profile');
    }

    // ✅ Predict sentiment using Naive Bayes
    const cleanedReview = tokenize(review); // Tokenize the review text
    const sentimentScore = predict_naive_bayes(cleanedReview); // Get the sentiment (1 for positive, 0 for negative)

    // ✅ Create review with sentiment_score
    await reviewModel.create({
      userId: userId,
      restaurantId: restaurantId,
      orderId: orderId,
      foodName: foodName,
      review,
      sentimentScore: sentimentScore
    });

    req.flash('success_msg', `Review for ${foodName} submitted! Sentiment: ${sentimentScore === 1 ? 'Positive' : 'Negative'}`);
    res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not submit review.');
    res.redirect('/users/profile');
  }
}