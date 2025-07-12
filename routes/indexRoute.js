const express = require('express');
const isLoggedin = require('../middlewares/isLoggedin');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('login-register',{loggedin:false});
})

router.get('/index',isLoggedin,(req,res)=>{
    res.render('index')
})


router.get("/cart",isLoggedin,async function(req,res){
    let user=await userModel.findOne({email:req.user.email})
    .populate("cart");
    let totalbill = 0;
    user.cart.forEach(function(item){
      const itemTotal = Number(item.price) + 20 - Number(item.discount);
      totalbill += itemTotal;
    })
    
    res.render("cart", {user,totalbill,title:"cart"});
})

router.get("/addtocart/:productid",isLoggedin,async function(req,res){
    let user=await userModel.findOne({email:req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success","added to cart");
    res.redirect("/shop");
})


module.exports=router;