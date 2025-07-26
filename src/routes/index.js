const express = require('express');
const isLoggedin = require('../middlewares/auth.middleware.js');
const verifyJWT = require('../middlewares/verifyJWT');
const userModel = require('../models/user.model');
const reviewModel = require('../models/review.model.js');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('login-register',{loggedin:false});
})

router.get('/index', isLoggedin, (req, res) => {
  const { query, location, price } = req.query;

  // later you might use query/location/price to fetch matching restaurants
  // but for now let's just pass them to the view
  res.render('index', {
    user: req.user,
    query: query || '',
    location: location || '',
    price: price || ''
  });
});



router.get('/profile', isLoggedin, verifyJWT, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    req.flash('error_msg', 'User not authenticated');
    return res.redirect('/login');
  }

  const user = await userModel.findById(userId)
    .populate({
      path: 'orders.items.restaurant',   
      model: 'Restaurant',               
      select: 'name'                     
    })
    .lean();

  if (!user) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/login');
  }

  const orders = (user.orders || []).filter(order =>
    order.items.some(item => item.status === 'completed')
  );

  // sort newest first
  orders.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

  // get reviewed restaurants
  const reviews = await reviewModel.find({ user_id: userId }).lean();
  const reviewedKeys = reviews.map(r => `${r.order_id}_${r.food_name}`);

  res.render('profile', { user, orders, reviewedKeys });
});


module.exports=router;