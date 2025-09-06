const mongoose = require("mongoose");
const reviewModel = require("../src/models/review.model");
const { getSentimentScore } = require("../src/algorithm/sentimentClient");

const MONGO_URI = "mongodb+srv://admin:admin@cluster0.chhhzzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function updateReviews() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const reviews = await reviewModel.find();
  console.log(`Found ${reviews.length} reviews`);

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    if (review.sentimentScore && review.sentimentScore !== 0) continue; // skip already processed

    try {
      const score = await getSentimentScore(review.review);
      review.sentimentScore = score;
      await review.save();
      console.log(`${i + 1}/${reviews.length} updated: ${review._id} -> ${score.toFixed(2)}`);
    } catch (err) {
      console.error(`Error updating review ${review._id}:`, err.message);
    }
  }

  console.log("✅ All reviews processed");
  mongoose.disconnect();
}

updateReviews();
