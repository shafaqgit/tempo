const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Topic = require("../models/topic");
const Difficulty = require("../models/difficulty");
const Category = require("../models/category");
const path = require("path");
const question = require("../models/question");
const mongoose = require('mongoose');

// router.get('/questions',(req, res)=>{

//     Question.aggregate(
//         [ 
//             {
//                 $unwind: {
//                   path: "$options"
//                 }
//               },
//               {
//                 $sample: {
//                   size: 10 //to shuffle values upto particular index 
//                 }
//               },
//               {
//                 $group: {
//                   _id: "$_id",
//                   questionContent: {
//                     "$first": "$questionContent"
//                   },
//                   correctAnswer: {
//                     "$first": "$correctAnswer"
//                   },
//                   options: {
//                     $push: "$options"
//                   },
//                   topic: {
//                     "$first": "$topic"
//                   },
//                   difficulty: {
//                     "$first": "$difficulty"
//                   },
//                   category: {
//                     "$first": "$category"
//                   }
//                 }
//               }
//         ]
//      ).exec((error, question)=> {
//         if(error){
//             return res.status(400).json({
//                 message: "Error in Displaying Questions",
//                 Err: error
//             });
//         }
//         else{
//             return res.status(200).json(question)
//         }
//     })
// });

router.get('/questions',(req, res)=>{

  Question.aggregate(
      [ 
          {
              $sample: {
                size: 10 //to shuffle values upto particular index 
              }
            },
            {
              $unwind: {
                path: "$options"
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
            },
            {
              $project: {
                options: 1,
                questionContent: 1,
                correctAnswer: 1,
                topic: 1,
                difficulty: 1,
                category: 1
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

// router.get('/questions/:topic', (req, res) => {

//   const topic = mongoose.Types.ObjectId(req.params.topic);

//   Question.aggregate([
//     {
//       $match: { topic },
//     },
//     {
//       $group: {
//         _id: "$difficulty",
//         questions: { $push: "$$ROOT" }
//       }
//     },
//     {
//       $project: {
//         easy: {
//           // $slice: ["$questions", 4] // you can change this to your preferred number of questions
//           $slice: [{ $slice: ["$questions", 4, { $size: "$questions" }] }, 4] // you can change this to your preferred number of questions
//         },
//         medium: {
//           $slice: [{ $slice: ["$questions", 2, { $size: "$questions" }] }, 2] // you can change this to your preferred number of questions
//         },
//         hard: {
//           $slice: [{ $slice: ["$questions", 4, { $size: "$questions" }] }, 4] // you can change this to your preferred number of questions
//         }
//       }
//     },
//     {
//       $project: {
//         questions: {
//           $concatArrays: ["$easy", "$medium", "$hard"]
//         }
//       }
//     },
//     {
//       $unwind: "$questions"
//     },
//     {
//       $sample: { size: 10 } // you can change this to your preferred number of questions
//     },
//     {
//       $replaceRoot: { newRoot: "$questions" }
//     },
//     {
//       $project: {
//         options: 1,
//         questionContent: 1,
//         correctAnswer: 1,
//         topic: 1,
//         difficulty: 1,
//         category: 1
//       }
//     }
//   ]).exec((error, question)=> {
//     if(error){
//         return res.status(400).json({
//             message: "Error in Displaying Questions",
//             Err: error
//         });
//     }
//     else{
//         return res.status(200).json(question)
//     }
// })
// });


router.get('/questions/:topic', (req, res) => {

  const topic = mongoose.Types.ObjectId(req.params.topic);
  
  const numEasy=4;
  const numMedium=4;
  const numHard=2;
  Question.aggregate([
    {
      $match: { topic: topic }
    },
    {
      $group: {
        _id: { difficulty: "$difficulty" },
        questions: {
          $push: {
            _id: "$_id",
            questionContent: "$questionContent",
            correctAnswer: "$correctAnswer",
            options: "$options"
          }
        }
      }
    },
    {
      $project: {
        difficulty: "$_id.difficulty",
        questions: {
          $slice: [
            "$questions",
            {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$_id.difficulty", "easy"] },
                    then: 4
                  },
                  {
                    case: { $eq: ["$_id.difficulty", "medium"] },
                    then: 4
                  },
                  {
                    case: { $eq: ["$_id.difficulty", "hard"] },
                    then: 2
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      $unwind: "$questions"
    },
    {
      $replaceRoot: {
        newRoot: "$questions"
      }
    },
    {
      $sample: {
        size: 1
      }
    },
    {
      $group: {
        _id: "$difficulty",
        questions: {
          $push: {
            _id: "$_id",
            questionContent: "$questionContent",
            correctAnswer: "$correctAnswer",
            options: "$options"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        difficulty: "$_id",
        questions: 1
      }
    }
  ]).exec((error, questions) => {
    if (error) {
      return res.status(400).json({
        message: "Error in Displaying Questions",
        Err: error
      });
    }
    else {
      return res.status(200).json(questions)
    }
  })
});



module.exports = router;
