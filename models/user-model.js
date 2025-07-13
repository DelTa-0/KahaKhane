const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  food: {
    name: String,
    price: Number,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

const userSchema=mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    cart:[cartItemSchema],
    orders:Array,
    contact:Number,
    picture:Buffer

})

module.exports=mongoose.model("User",userSchema);