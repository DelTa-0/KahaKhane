const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');


module.exports=async function(req,res,next) {
    try{
        const token=req.cookies.token;
        if(!token){
            req.flash("error_msg","You need to login to continue");
            return res.redirect('/');
        }
        const decoded=jwt.verify(token,process.env.JWT_KEY);
        
        const user=await userModel.findOne({email:decoded.email}).select("-password");
        
        if(!user){
            req.flash("error_msg","User not found");
            return res.redirect('/');
        }
        req.user=user;
        next();
    }catch(err){
        console.log(err.message);
        req.flash("error_msg","something went wrong");
        res.redirect('/');
    }
    
}