const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Topic = require('../models/topic');

router.post('/add_parcel',(req, res) =>{

    // for (const q in req.body) {
    //    const x= Topic.find({ tName: req.body[q].topic })
    //    .exec((error,topic) => {
        // if (x)
    //    console.log("Topic Found: "+x)
    //    else
    //    console.log(`Not Found: ${topic}`)
    // });
    //   }
      
   const ques=  Question.insertMany(req.body);
   
        if(ques) return res.status(201).json({
        message: 'Questions has added',
        Questions: ques
     });
   
});

module.exports = router;