// updateReviewSentiment.js
const mongoose = require('mongoose');
const reviewModel = require('../models/review-model'); // adjust path to your review model
const { predict_naive_bayes, tokenize } = require('../algorithm/naiveBayes');

// ✅ ----------------------
// 1. TRAINING PARAMETERS
// (You can build these from your Python export or hardcode after training)
// For now, let's assume you export these from your training phase as JSON
// Example: require('./naiveBayesParams.json')
const fs = require('fs');

// load params
const params = JSON.parse(fs.readFileSync('naiveBayesParams.json', 'utf8'));
const word_counts = params.word_counts;
const class_counts = params.class_counts;
const total_words = params.total_words;
const vocab_size = params.vocab_size;

// ✅ ----------------------
// 2. CONNECT TO MONGO
mongoose.connect('mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ Mongo connection error:', err);
  process.exit(1);
});

(async () => {
  try {
    const reviews = await reviewModel.find();
    console.log(`📌 Found ${reviews.length} reviews.`);

    for (const review of reviews) {
      const words = tokenize(review.review); // tokenize the review text
      const sentiment = predict_naive_bayes(words, word_counts, class_counts, total_words, vocab_size);

      // sentiment will be 1 for positive, 0 for negative
      review.sentiment_score = sentiment;
      await review.save();
      console.log(`✅ Updated review ${review._id} with sentiment ${sentiment}`);
    }

    console.log('🎉 All reviews updated successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error updating reviews:', err);
    mongoose.connection.close();
  }
})();
