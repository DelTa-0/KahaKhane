const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userModel = require('../models/user-model');
const restaurantModel = require('../models/restaurant-model');
const mongoose = require('mongoose');

router.post('/add', verifyJWT, async (req, res) => {
  const { restaurantId, foodname } = req.body;
  const { itemPrice } = req.body;
  const { id } = req.user;
  console.log(restaurantId,foodname,itemPrice);

  // 💡 Always validate the ID
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).send("Invalid restaurant ID");
  }

  try {
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) return res.status(404).send("Restaurant not found");

    const foodItem = restaurant.menu.find(item => item.name === foodname);
    if (!foodItem) return res.status(404).send("Food item not found");

    await userModel.findByIdAndUpdate(id, {
      $push: {
        cart: {
          restaurant: restaurant._id,
          food: { name: foodItem.name, price: parseFloat(itemPrice) },
          quantity: 1,
        },
      },
    });

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/',verifyJWT,async(req,res)=>{
    const {email}=req.user;
        try {
        const user = await userModel.findOne({ email }).populate("cart");

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render('cart', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }

})

module.exports = router;
