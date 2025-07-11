
const reviewModel = require('../models/review-model');

module.exports.getReviews=async function (req,res){
    try {
        const review = await reviewModel.find({});
        res.json(review);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
      }
    }