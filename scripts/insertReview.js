// scripts/insertReviews.js
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Sentiment = require('sentiment');

const reviewModel = require('../models/review-model');

const restaurantModel = require('../models/restaurant-model');

const sentiment = new Sentiment();

// ✅ Change to your real database name
const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.chhhzzl.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Mongo connection error:', err));

(async () => {
  try {
    const restaurants = await restaurantModel.find();
    if (!restaurants.length) {
      console.error('❌ No restaurants found in DB!');
      process.exit(1);
    }

    console.log(`✅ Found ${restaurants.length} restaurants`);

    let index = 0;
    const insertPromises = [];

    fs.createReadStream('yelp_reviews.csv')
      .pipe(csv())
      .on('data', (row) => {
        try {
          const text = row.ReviewText?.trim();
          if (!text) return;

          const score = sentiment.analyze(text).score;

          // round-robin restaurant assignment
          const restaurant = restaurants[index % restaurants.length];
          index++;

          const reviewDoc = new reviewModel({
            restaurant_id: restaurant._id,
            review: text,
            sentiment_score: score
          });

          // Save and push promise
          const p = reviewDoc.save()
            .then(() => console.log(`✅ Review saved for ${restaurant.name}`))
            .catch(err => console.error(`❌ Error saving review for ${restaurant.name}:`, err));

          insertPromises.push(p);

        } catch (err) {
          console.error('❌ Error processing row:', err);
        }
      })
      .on('end', async () => {
        console.log(`⌛ Waiting for ${insertPromises.length} reviews to finish...`);
        await Promise.all(insertPromises);
        console.log('✅ All reviews inserted successfully!');
        mongoose.connection.close();
      });

  } catch (err) {
    console.error('❌ Script error:', err);
    mongoose.connection.close();
  }
})();
