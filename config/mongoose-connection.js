const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_KEY);
module.exports=mongoose.connection;