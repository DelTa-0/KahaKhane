const express = require('express');
const { getProfile } = require('../controllers/user.controller');
const isLoggedin = require('../middlewares/auth.middleware.js');
const router=express.Router();


router.get('/profile', isLoggedin, getProfile);

module.exports = router;