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
      // make response as json formatted not string
      req.flash("error_msg", "You already have an account");
      return res.redirect("/");
    }

    // use async await
    // use service for this business operation
    // dont keep everything inside controller
    // controller is meant just to keep communication between business logic and views - service - views
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            email,
            password: hash,
            fullname,
          });

          req.flash("success_msg", "user created successfully");
          return res.redirect("/");
        }
      });
    });
  } catch (err) {
    console.log(err.message);
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
          "secret_key",
          { expiresIn: "1h" }
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
  // res.cookie("token", "");
  res.redirect("/login");
};


