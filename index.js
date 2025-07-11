const express = require('express');
const ejs = require('ejs');
require('dotenv').config();
require('./config/mongoose-connection.js')
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const indexRoute = require('./routes/indexRoute');
const adminRoute = require('./routes/adminRoute');
const restaurantRoute = require('./routes/restaurantRoute.js');
const session = require('express-session');
const flash = require('connect-flash');
const app=express();
app.set('view engine','ejs');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));



app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/users',userRoute);
app.use('/admin',adminRoute);
app.use('/',indexRoute);
app.use('/restaurant',restaurantRoute);

app.listen(3000,()=>{
    console.log("running on 3000");
})