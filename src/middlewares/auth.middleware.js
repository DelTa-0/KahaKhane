const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */

module.exports = function (req, res, next) {
  const user = req.user;
  if (!user) {
    req.flash("error_msg", "Please login to access this page!");
    return res.redirect("/login");
  }

  next();
};
