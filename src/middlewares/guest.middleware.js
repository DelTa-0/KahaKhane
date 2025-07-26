module.exports = function (req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      next();
      return;
    }
    
    req.cookies.token = undefined;
    res.redirect("/");
  } catch (err) {
    console.log(err.message);
    req.flash("error_msg", "something went wrong");
    res.redirect("/");
  }
};
