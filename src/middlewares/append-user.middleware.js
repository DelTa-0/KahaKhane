const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { APP_CONFIG } = require('../config/app.config');

/**
 * Middleware to append user to request object based on JWT token
 */
const appendUserToRequest = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null; // no token, user is guest
      return next();
    }

    const decoded = jwt.verify(token, APP_CONFIG.JWT_KEY);

    const user = await UserModel.findOne({ email: decoded.email }).select('-password');
    if (!user) {
      req.user = null;
      req.flash('error_msg', 'User not found');
      res.cookie('token', '');
      return res.redirect('/login');
    }

    req.user = user; // attach user
    next();

  } catch (error) {
    console.error('Error in appendUserToRequest middleware:', error);

    req.user = null; // fallback as guest

    if (error.name === 'TokenExpiredError') {
      req.flash("error_msg", "Session expired, please login again!");
      res.cookie('token', '');
      return res.redirect('/login');
    }

    // fallback for invalid token or other errors
    req.flash("error_msg", "Invalid session, please login again!");
    res.cookie('token', '');
    return res.redirect('/login');
  }
};

module.exports = appendUserToRequest;
