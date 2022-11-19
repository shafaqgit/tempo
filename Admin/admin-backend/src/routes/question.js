const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Topic = require('../models/topic');
const Difficulty = require('../models/difficulty');

router.post('/addQuestion',(req, res) =>{

       const x = Topic.findOne({tName: req.body["topic"] })
       .then(topic=> {
        req.body["topic"]=topic._id.valueOf();

        const ques=  Question.insert(req.body);
   
        if(ques) return res.status(201).json({
        message: 'Questions has added',
        Questions: ques
     });
        
    })
    .catch(err=>console.log(err));
   
});

router.post('/addParcel',(req, res) =>{

    for ( const ques in req.body){
        
        // Replacing the 'Name' of Topic with it's ID
        Topic.findOne({tName: ques["topic"] })
        .then(topic=> {
        req.body["topic"]=topic._id;

        }).catch(err=>console.log("Error From adding topic in ques.......",err));

        // Replacing the 'Name' of Difficulty-level with it's ID
        Difficulty.findOne({dName: ques["difficulty"] })
        .then(difficulty=> {
        req.body["difficulty"]=difficulty._id;

        }).catch(err=>console.log("Error From adding diff-level in ques.......",err));


    } 
    // Storing list of all Questions in Database
    const ques=  Question.insertMany(req.body);
    if(ques) return res.status(201).json({
    message: 'Questions has added',
    Questions: ques
    });
});

module.exports = router;