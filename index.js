import express from 'express';
import userRouter from './routes/userRouter.js';
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.send("hello working")
})

app.use('/user',userRouter);

app.listen(3000,()=>{
    console.log("server running on 3000 port");
})