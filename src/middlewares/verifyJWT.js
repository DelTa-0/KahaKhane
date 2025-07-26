// middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Access Denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send("Invalid token.");
  }
};

module.exports = verifyJWT;
