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

router.post('/addTopic',(req, res) =>{
   
    req.body.tName=req.body.tName.toLowerCase();
    Topic.findOne({ tName: req.body.tName})
    .exec((error,topic) => {
        if(topic) return res.status(400).json({
        message: 'Given Topic already added'
     });
     const {
        tName
     } = req.body;
     console.log("Sent request of topic: "+ req.body.tName);
     const _topic = new Topic({
        tName
    });
    _topic.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Topic could not be added...Something went wrong',
                e:error
            });
        }
        if(data)
        {
            return res.status(200).json({
                topic:data
            })
        }
      });
    });
});

module.exports = router;