
module.exports = function (req, res, next) {
  try {
    const user = req.user
    if (!user) {
      return next();
    }
    return res.redirect("/login");
  } catch (err) {
    console.error("Guest middleware error:", err.message);
    req.flash("error_msg", "Something went wrong");
    return res.redirect("/");
  }
};
