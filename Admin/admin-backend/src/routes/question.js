const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const Topic = require('../models/topic');
const Difficulty = require('../models/difficulty');
const Category = require('../models/category');

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
        Topic.findOne({tName: req.body[ques].topic })
        .then(topic=> {
            req.body[ques].topic=topic._id;

            // Replacing the 'Name' of Difficulty-level with it's ID
            Difficulty.findOne({dName: req.body[ques].difficulty })
            .then(difficulty=> {
                req.body[ques].difficulty=difficulty._id;

                // Replacing the 'Name' of Category with it's ID
                Category.findOne({cName: req.body[ques].category })
                .then(category=> {
                    req.body[ques].category=category._id;

                        // Adding the Question to Database
                        Question.create(req.body[ques], function(err, res) {
                            if (err) throw err;
                            console.log("Ques added:", res);

                        });

                }).catch(err=>console.log("Error From adding Category in ques.......",err));

                
            }).catch(err=>console.log("Error From adding diff-level in ques.......",err));
   
        }).catch(err=>console.log("Error From adding topic in ques.......",err));

    } 
    // Storing list of all Questions in Database
    // const ques=  Question.insertMany(req.body);
    // if(ques) 
    return res.status(201).json({
    message: 'Questions has added',
    // Questions: ques
    });
});

module.exports = router;