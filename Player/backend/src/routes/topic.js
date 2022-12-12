const express = require('express');
const router = express.Router();
const Topic = require('../models/topic');


router.get('/viewTopic',(req, res)=>{
    Topic.find().exec((error, topic)=> {
        if(error){
            return res.status(400).json({
                message: "Error in Displaying Topics",
                Err: error
            });
        }
        else{
            return res.status(200).json({
                topic
            })
        }
    })
});

module.exports = router;