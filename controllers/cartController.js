// POST /cart/add
module.exports.addToCart = (req, res) => {
  const { restaurantId, itemName, itemPrice } = req.body;

  if (!req.session.cart) req.session.cart = [];

  req.session.cart.push({
    restaurantId,
    name: itemName,
    price: parseFloat(itemPrice),
    quantity: 1,
  });

  res.redirect('/cart');
};
