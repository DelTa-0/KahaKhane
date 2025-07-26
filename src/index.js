const express = require('express');
require('ejs');
require('dotenv').config();
require('./config/db.config.js')

const cookieParser = require('cookie-parser');
const router = require('./routes/index.js');
const session = require('express-session');
const flash = require('connect-flash');
const { APP_CONFIG } = require('./config/app.config.js');
const appendUserToRequest = require('./middlewares/append-user.middleware.js');
const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/images', express.static('public/images'));

const secret = APP_CONFIG.SESSION_SECRET;
if(!secret){
  console.error("Make sure to keep session secret!");
  process.abort(-1);
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(appendUserToRequest);
app.use('/', router);

/** If no route available, redirect to main page */
app.use((req,res)=>{
  res.redirect('/login');
});

const port = APP_CONFIG.PORT;
app.listen(port,()=>{
    console.log(`Application running on port ${port}`);
})