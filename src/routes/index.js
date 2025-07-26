const express = require('express');
const router = express.Router();
const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const adminRoute = require('./admin.route');
const restaurantRoute = require('./restaurant.route');
const cartRoute = require('./cart.route');
const reviewRoute = require('./review.route');

router.use('/users', userRoute);
router.use('/admin', adminRoute);
router.use('/restaurant', restaurantRoute);
router.use('/cart', cartRoute);
router.use('/review', reviewRoute);
router.use('/', authRoute);

module.exports = router;