const express = require('express');
const isLoggedin = require('../middlewares/auth.middleware.js');

const router = express.Router();
const { addToCart, updateCart, removeFromCart, getCheckoutPage, postCheckout, getCart } = require('../controllers/cart.controller.js');

router.get('/',isLoggedin,getCart);
router.post('/add', isLoggedin,addToCart);
router.post('/update/:itemId', isLoggedin, updateCart);
router.post('/remove/:itemId', isLoggedin, removeFromCart);
router.get('/checkout', isLoggedin, getCheckoutPage);
router.post('/checkout', isLoggedin, postCheckout);


module.exports = router;
