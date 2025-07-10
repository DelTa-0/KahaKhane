import express from 'express';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import ejs from 'ejs';
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.send("hello working")
})

app.use('/user',userRouter);

app.listen(3000,()=>{
    console.log("server running on 3000 port");
})