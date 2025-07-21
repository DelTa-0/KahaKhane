const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const restaurantModel = require('../models/restaurant-model'); // adjust path if needed

// ==== CONFIG ====
const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.chhhzzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // change to your DB
const SAVE_DIR = path.join(__dirname, '../public/images/restaurants');

(async () => {
  try {
    // connect to DB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // make sure folder exists
    await fs.ensureDir(SAVE_DIR);

    // get restaurants with picture
    const restaurants = await restaurantModel.find({ picture: { $exists: true, $ne: '' } });
    console.log(`🔎 Found ${restaurants.length} restaurants with picture field.`);

    for (let r of restaurants) {
      try {
        const imgUrl = r.picture;
        if (!imgUrl || !/^https?:\/\//i.test(imgUrl)) {
          console.log(`⚠️ Skipping ${r.name}, invalid URL: ${imgUrl}`);
          continue;
        }

        const fileExt = path.extname(imgUrl.split('?')[0]) || '.jpg';
        const fileName = `${r.restaurant_id}${fileExt}`;
        const filePath = path.join(SAVE_DIR, fileName);

        // skip if already downloaded
        if (await fs.pathExists(filePath)) {
          console.log(`✅ Already downloaded: ${fileName}`);
          continue;
        }

        console.log(`⬇️ Downloading: ${imgUrl}`);
        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(filePath, response.data);
        console.log(`✅ Saved: ${fileName}`);

        // update restaurant.picture to local path
        const newPath = `/images/restaurants/${fileName}`;
        await restaurantModel.updateOne({ _id: r._id }, { $set: { picture: newPath } });
        console.log(`📝 Updated DB for ${r.name}`);
      } catch (err) {
        console.error(`❌ Error processing ${r.name}:`, err.message);
      }
    }

    console.log('🎉 All done!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('🔥 Script error:', err);
    process.exit(1);
  }
})();
