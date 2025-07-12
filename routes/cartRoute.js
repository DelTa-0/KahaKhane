const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userModel = require('../models/user-model');

router.post('/cart/add', cartController.addToCart);

router.get('/cart',async(req,res)=>{
    const email=req.cookies.user?.email;
    if(!email) return res.redirect('/')
    let user=await userModel.findOne({email:req.user.email})
    .populate("cart");
    console.log(user);
    res.render('cart',{user});
})

module.exports = router;
