const mongoose = require("mongoose");
const { APP_CONFIG } = require("./app.config");

const mongoUri = APP_CONFIG.MONGO_URI;
if (!mongoUri) {
  console.error("Mongo uri not found!");
}

mongoose.connect(mongoUri)
  .then(()=>console.log("Database conneced successfully!"))
  .catch(err=>console.error("Database connection faied!"));
  
module.exports = mongoose.connection;
