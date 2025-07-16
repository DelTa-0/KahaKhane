const mongoose = require('mongoose');
const restaurantModel = require('../models/restaurant-model'); // adjust path

async function migrate() {
  await mongoose.connect('mongodb+srv://admin:admin@cluster0.chhhzzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  const docs = await restaurantModel.find();
  for (const doc of docs) {
    if (!doc.location || !doc.location.coordinates || doc.location.coordinates.length === 0) {
      if (typeof doc.lat === 'number' && typeof doc.lng === 'number') {
        doc.location = {
          type: 'Point',
          coordinates: [doc.lng, doc.lat] // remember [lng, lat]
        };
        // If you had `Location` string field, move it to `address`
        if (doc.Location && !doc.address) {
          doc.address = doc.Location;
        }
        await doc.save();
        console.log(`Migrated ${doc.name}`);
      }
    }
  }

  console.log('Migration completed');
  process.exit();
}

migrate().catch(console.error);
