const express = require('express');
const isLoggedin = require('../middlewares/isLoggedin');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('login-register',{loggedin:false});
})

router.get('/index',isLoggedin,(req,res)=>{
    res.render('index')
})

module.exports=router;