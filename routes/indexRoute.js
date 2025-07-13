const express = require('express');
const isLoggedin = require('../middlewares/isLoggedin');
const verifyJWT = require('../middlewares/verifyJWT');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('login-register',{loggedin:false});
})

router.get('/index',isLoggedin,(req,res)=>{
    res.render('index')
})

router.get('/review', verifyJWT, (req, res) => {
  res.render('review');
});

router.post('/review', verifyJWT, async (req, res) => {
  const { review } = req.body;
  // You can enhance by attaching it to an order/restaurant
  console.log(`Review from ${req.user.email}:`, review);
  req.flash('success_msg', 'Thanks for your review!');
  res.redirect('/');
});


module.exports=router;