const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.getLoginPage = function (req,res){
  res.render('login-register',{loggedin:false});
}

/**
 * 
 */
module.exports.getIndexPage = function (req, res) {
 const { query, location, price } = req.query;

  res.render('index', {
    user: req.user,
    query: query || '',
    location: location || '',
    price: price || ''
  });
}

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) {
      req.flash("error_msg", "You already have an account");
      return res.redirect("/login");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    let newUser = await userModel.create({
      email,
      password: hash,
      fullname,
    });

    // // Set JWT token after registration (use same secret as in login)
    // let token = jwt.sign(
    //   { email: newUser.email, id: newUser._id },
    //   "secret_key",
    //   { expiresIn: "30m" }
    // );
    // res.cookie("token", token);
    req.flash("success_msg", "User created successfully. Please login.");
    return res.redirect("/login");
  } catch (err) {
    console.log(err.message);
    req.flash("error_msg", "Registration failed. Please try again.");
    return res.redirect("/register");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      req.flash("error_msg", "Enter email and password!");
      res.redirect("/login");
      return;
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      req.flash("error_msg", "email or password incorrect");
      res.redirect("/login");
      return;
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        console.error(err);
        req.flash("error_msg", "Something went wrong");
        return res.redirect("/login");
      }

      if (result) {
        let token = jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_KEY,
          { expiresIn: "30m" }
        );
        res.cookie("token", token);
        req.flash("success_msg", "You have successfully logged in!!");
        res.redirect("/");
      } else {
        req.flash("error_msg", "Email or password incorrect");
        res.redirect("/login");
      }
    });

  } catch (err) {
    req.flash("error_msg", "Please enter email and password!");
    res.redirect("/login");
  }
};

module.exports.logout = function (req, res) {
  res.cookie("token", "");
  res.redirect("/login");
};


