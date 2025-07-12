const mongoose = require('mongoose');
const restaurantModel = require('../models/restaurant-model');

mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanMenus() {
  try {
    const restaurants = await restaurantModel.find({});

    for (let restaurant of restaurants) {
      const rawMenu = restaurant.menu?.[0];

      if (typeof rawMenu === 'string') {
        try {
          // Replace single quotes with double quotes for valid JSON
          const parsed = JSON.parse(rawMenu.replace(/'/g, '"'));

          // Convert object to array
          const cleanedMenu = Object.entries(parsed).map(([name, price]) => ({
            name,
            price: parseFloat(price),
          }));

          restaurant.menu = cleanedMenu;
          await restaurant.save();
          console.log(`✅ Cleaned menu for ${restaurant['Restaurant Name']}`);
        } catch (e) {
          console.error(`❌ Failed to parse menu for ${restaurant['Restaurant Name']}`);
        }
      }
    }

    console.log('✨ Cleaning complete.');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

cleanMenus();
