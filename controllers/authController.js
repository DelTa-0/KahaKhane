const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const restaurantModel =require('../models/restaurant-model');


module.exports.registerUser=async function(req,res) {
    try{
        let {email,password,fullname}=req.body;
        let user= await userModel.findOne({email:email});
        if(user){
            // make response as json formatted not string
             req.flash("error_msg", "You already have an account");
            return res.redirect("/");
        }
        

        // use async await
        // use service for this business operation
        // dont keep everything inside controller
        // controller is meant just to keep communication between business logic and views - service - views
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async(err,hash)=>{
                if(err) return res.send(err.message);
                else{
                    let user=await userModel.create({
                        email,
                        password:hash,
                        fullname,
                    });
                    let token=jwt.sign({email:user.email,id:user._id},"secret_key");
                    res.cookie("token",token);
                    req.flash("success_msg","user created successfully");
                }
            })
        })
    }catch(err){
        console.log(err.message);
    }
    
}

module.exports.loginUser=async function(req,res) {
    try{
        let {email,password}=req.body;
        let user=await userModel.findOne({email:email});
        if(!user) return req.flash("error_msg","email or password incorrect");
        bcrypt.compare(password,user.password,function(err,result){
            if(result){
                let token=jwt.sign({email:user.email,id:user._id},"secret_key");
                res.cookie("token",token);
                res.redirect("/index");
            }
            else{
                return req.flash("error_msg","email or password incorrect");
            }
        })

    }catch(err){
        console.log(err.message);
    }
    
}

module.exports.logout=function (req,res){
    res.cookie("token","");
    res.redirect("/")
    
}

