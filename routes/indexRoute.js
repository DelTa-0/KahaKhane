const express = require('express');
const isLoggedin = require('../middlewares/isLoggedin');
const verifyJWT = require('../middlewares/verifyJWT');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('login-register',{loggedin:false});
})

router.get('/index',isLoggedin,(req,res)=>{
    res.render('index',{user:req.user});
})


router.get('/profile',verifyJWT, async (req, res) => {
  const userId = req.session.userId; // or req.user._id

  const user = await User.findById(userId);

  // Orders must be completed ones
  const orders = user.orders
    .filter(o => o.status === 'completed')
    .map(o => ({
      ...o._doc,
      restaurantName: o.restaurantName || 'Unknown',
      restaurant_id: o.restaurantId // for review posting
    }));

  res.render('profile', { user, orders });
});


router.get('/profile/update',isLoggedin,(req,res)=>{
    res.render('update-profile')
})


module.exports=router;