const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model'); // adjust path if needed
const { APP_CONFIG } = require('../config/app.config.js');

const appendUserToRequest = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next();
    }

    const jwtKey = APP_CONFIG.JWT_KEY;

    let decoded;
    try {
      decoded = jwt.verify(token, jwtKey);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        req.flash('error_msg', 'Your token has expired. Please log in again.');
        res.clearCookie('token');
        return res.redirect('/login');
      } else {
        console.error('JWT verification error:', err.message);
        req.flash('error_msg', 'Invalid token token. Please log in again.');
        res.clearCookie('token');
        return res.redirect('/login');
      }
    }

    const user = await UserModel.findOne({ email: decoded.email }).select('-password');

    if (!user) {
      req.flash('error_msg', 'User not found.');
      res.clearCookie('token');
      return res.redirect('/login');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error('Unexpected error in appendUserToRequest:', err);
    req.flash('error_msg', 'Something went wrong.');
    return res.redirect('/login');
  }
};

module.exports = appendUserToRequest;
