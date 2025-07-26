const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// 👉 Import your tokenizer & predictor
const { predict_naive_bayes, tokenize } = require('../algorithm/naiveBayes')
// 👉 Import your models
const restaurantModel = require('../src/models/restaurant.model');
const reviewModel = require('../src/models/review.model');

// ✅ Update this to your own MongoDB URI
const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.chhhzzl.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  try {
    // ✅ Connect to DB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // ✅ Load all restaurants (we will randomly assign reviews)
    const restaurants = await restaurantModel.find().lean();
    if (restaurants.length === 0) {
      console.error('❌ No restaurants found in DB.');
      return;
    }
    console.log(`✅ Loaded ${restaurants.length} restaurants.`);

    const docsToInsert = [];
    let restaurantIndex = 0;

    fs.createReadStream('./review.csv') // <-- path to your CSV
      .pipe(csv())
      .on('data', (row) => {
        const reviewText = row.review?.trim();
        if (!reviewText) return;

        // 👉 Tokenize & score
        const tokens = tokenize(reviewText);
        const sentimentScore = predict_naive_bayes(tokens);

        // 👉 Random restaurant
        const selectedRestaurant = restaurants[restaurantIndex % restaurants.length];
        restaurantIndex++;

        const doc = {
          userId: null, // you can leave null if you don't have user
          restaurantId: selectedRestaurant._id,
          orderId: null,
          foodName: '', // optional
          review: reviewText,
          sentiment_score: sentimentScore,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        docsToInsert.push(doc);
      })
      .on('end', async () => {
        if (docsToInsert.length === 0) {
          console.warn('⚠️ No reviews found in CSV.');
          await mongoose.connection.close();
          return;
        }

        try {
          const result = await reviewModel.insertMany(docsToInsert);
          console.log(`✅ Inserted ${result.length} reviews.`);
        } catch (err) {
          console.error('❌ Insert error:', err);
        } finally {
          await mongoose.connection.close();
        }
      });

  } catch (err) {
    console.error('❌ Error in script:', err);
    mongoose.connection.close();
  }
}

main();
