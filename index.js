const express = require('express');
const ejs = require('ejs');
require('./config/mongoose-connection.js')
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const indexRoute = require('./routes/indexRoute');
const adminRoute = require('./routes/adminRoute');
const app=express();
app.set('view engine','ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/users',userRoute);
app.use('/admin',adminRoute);
app.use('/',indexRoute);

app.listen(3000,()=>{
    console.log("running on 3000");
})