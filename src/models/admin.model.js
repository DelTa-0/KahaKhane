const mongoose = require('mongoose');

const adminSchema=mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },  
    products:Array,
    picture:{
        type:String,
        required:true
    },
    gstin:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("admin",adminSchema);