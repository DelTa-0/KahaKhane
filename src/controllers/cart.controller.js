const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const restaurantModel = require('../models/restaurant.model');
const { ORDER_STATUS } = require('../config/app.config.js');
// POST /cart/add
module.exports.addToCart = async (req, res) => {
  const { restaurantId, foodname } = req.body;
  const { itemPrice } = req.body;
  const { id } = req.user;
  

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
    req.flash("success_msg","item added to cart");
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.updateCart=async (req, res) => {
  const { itemId } = req.params;
  const { action } = req.body;
  const { id } = req.user;

  try {
    const user = await userModel.findById(id);

    const cartItem = user.cart.id(itemId);
    if (!cartItem) {
      return res.status(404).send('Cart item not found');
    }

    if (action === 'add') {
      cartItem.quantity += 1;
    } else if (action === 'reduce') {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        user.cart.id(itemId).remove(); // auto remove if quantity <= 0
      }
    }

    await user.save();
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating cart');
  }
};


module.exports.removeFromCart=async (req, res) => {
  const { itemId } = req.params;
  const { id } = req.user;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/cart');
    }

    const removed = user.cart.pull({ _id: itemId });
    if (!removed) {
      req.flash('error_msg', 'Item not found in cart');
      return res.redirect('/cart');
    }

    await user.save();
    req.flash('success_msg', 'Item removed from cart');
    res.redirect('/cart');
  } catch (err) {
    console.error('Remove from cart error:', err);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/cart');
  }
};

module.exports.getCheckoutPage = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  const totalPrice = user.cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  res.render('checkout', { totalPrice });
};

module.exports.postCheckout=async (req, res) => {
  const { instructions } = req.body;
  const user = await userModel.findById(req.user._id).populate('cart.restaurant');
  if (!user || user.cart.length === 0) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/cart');
  }

  const order = {
    items: user.cart.map(item => ({
      restaurant: item.restaurant._id,
      food: item.food,
      quantity: item.quantity,
    })),
    totalPrice: user.cart.reduce((acc, item) => acc + item.food.price * item.quantity, 0),
    paymentMethod: 'Cash on Delivery',
    status:ORDER_STATUS.COMPLETED,
    instructions,
    orderedAt: new Date(),
  };

  user.orders.push(order);
  const firstRestaurantId = user.cart[0].restaurant._id; 

  user.cart = [];
  await user.save();
  req.flash("success_msg","order completed. You can give review from your profile.")
  res.redirect(`/restaurant/browse`);
};

module.exports.getCart = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await userModel.findById(id).populate('cart.restaurant');

    if (!user) return res.status(404).send('User not found');

    res.render('cart', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

}
