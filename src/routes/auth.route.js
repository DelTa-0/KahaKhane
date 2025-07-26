const express = require('express');
const isLoggedin = require('../middlewares/auth.middleware.js');
const isGuest = require('../middlewares/guest.middleware.js');
const { registerUser, loginUser, logout, getLoginPage, getIndexPage } = require('../controllers/auth.controller');

const router=express.Router();

router.get('/login', isGuest, getLoginPage);
router.get('/logout',isLoggedin, logout);

router.post('/register',isGuest, registerUser);
router.post('/login', isGuest, loginUser);
router.get('/', isLoggedin, getIndexPage);

module.exports=router;