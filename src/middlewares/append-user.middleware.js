const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { APP_CONFIG } = require('../config/app.config');

// check  why token is removed from request cookies after first success in all the code
/**
 * Middleware to append user to request object based on JWT token
 */


const appendUserToRequest = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const jwtKey = APP_CONFIG.JWT_KEY;
    const decoded = jwt.verify(token, jwtKey);
    const user = await UserModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/");
    }
    req.user = user;
  }
  next();
};

module.exports = appendUserToRequest;
