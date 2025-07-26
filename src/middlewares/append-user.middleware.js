const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const appendUserToRequest = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await UserModel
      .findOne({ email: decoded.email })
      .select("-password");

      console.log(user);
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/");
    }


    req.user = user;
    console.log(req.user, "added");

  }
  next();
};

module.exports = appendUserToRequest;
