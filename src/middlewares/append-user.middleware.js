const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { APP_CONFIG } = require('../config/app.config');

/**
 * Middleware to append user to request object based on JWT token
 */
const appendUserToRequest = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const decoded = jwt.verify(token, APP_CONFIG.JWT_KEY);

      const user = await UserModel.findOne({ email: decoded.email }).select('-password');
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/');
      }

      req.user = user;
    }
    next();
  } catch (error) {
    console.error('Error in appendUserToRequest middleware:', error);

    if (error.name === 'TokenExpiredError') {
    return res.redirect('/login');
  
}
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = appendUserToRequest;
