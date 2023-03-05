const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Topic = require("../models/topic");
const Difficulty = require("../models/difficulty");
const Category = require("../models/category");
const path = require("path");
const question = require("../models/question");

router.get('/questions',(req, res)=>{

    Question.aggregate(
        [ 
            {
                $unwind: {
                  path: "$options"
                }
              },
              {
                $sample: {
                  size: 10 //to shuffle values upto particular index 
                }
              },
              {
                $group: {
                  _id: "$_id",
                  questionContent: {
                    "$first": "$questionContent"
                  },
                  correctAnswer: {
                    "$first": "$correctAnswer"
                  },
                  options: {
                    $push: "$options"
                  },
                  topic: {
                    "$first": "$topic"
                  },
                  difficulty: {
                    "$first": "$difficulty"
                  },
                  category: {
                    "$first": "$category"
                  }
                }
              }
        ]
     ).exec((error, question)=> {
        if(error){
            return res.status(400).json({
                message: "Error in Displaying Questions",
                Err: error
            });
        }
        else{
            return res.status(200).json(question)
        }
    })
});


module.exports = router;
