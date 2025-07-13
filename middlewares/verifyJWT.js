// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.cookies.token; // assuming the cookie is named 'token'

    if (!token) {
        return res.status(401).send('Access Denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY); // replace with your secret
        req.user = decoded; // decoded contains email and id
        next();
    } catch (err) {
        return res.status(400).send('Invalid token.');
    }
};

module.exports = verifyJWT;
