const express = require('express');
const router = express.Router();
const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const adminRoute = require('./admin.route');
const restaurantRoute = require('./restaurant.route');
const cartRoute = require('./cart.route');
const reviewRoute = require('./review.route');
const isLoggedin = require('../middlewares/auth.middleware.js');

router.use('/users',isLoggedin, userRoute);
router.use('/admin',isLoggedin, adminRoute);
router.use('/restaurant',isLoggedin, restaurantRoute);
router.use('/cart',isLoggedin, cartRoute);
router.use('/review',isLoggedin, reviewRoute);
router.use('/', authRoute);

module.exports = router;