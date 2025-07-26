const express = require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    res.send("Feature comming soon!");
})

module.exports = router;