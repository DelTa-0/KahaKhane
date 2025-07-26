const express = require('express');
const isLoggedin = require('../middlewares/auth.middleware.js');
const guestMiddleware = require('../middlewares/guest.middleware.js');
const { registerUser, loginUser, logout, getLoginPage, getIndexPage } = require('../controllers/auth.controller');

const router=express.Router();

router.get('/login',guestMiddleware,getLoginPage);
router.get('/logout',isLoggedin,logout);

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/', isLoggedin, getIndexPage);

module.exports=router;