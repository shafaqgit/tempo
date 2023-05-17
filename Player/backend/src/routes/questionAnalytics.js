const express = require("express");
const mongoose = require('mongoose');
const querystring = require('querystring');
const axios = require('axios');
const router = express.Router();
const User=require("../models/user");
const Question = require("../models/question");
const Topic = require("../models/topic");
const Result = require("../models/Result");
const multiplayerResult= require("../models/multiplayerResult")
const Difficulty = require("../models/difficulty");
const Category = require("../models/category");
const Stage = require('../models/stage');
const path = require("path");
const question = require("../models/question");
const e = require("express");
const { request } = require("http");





router.get("/linechart", async (req, res) => {

    Result.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'player',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$player',
          playerName: { $first: '$user.firstName' },
          scores: { $push: '$Total_Score' }
        }
      }
    ]).exec()
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((error) => {
      return res.status(400).json(error );
    });
  
  
});





//api for percentage progress in each topic ofa specific player
router.get('/players/:id/progress', async (req, res) => {
  const userId  = mongoose.Types.ObjectId(req.params.id);

  try {
    // Find the user by ID
    const user = await User.findById(userId).lean().exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

   
    const topicIds = user.personalTopics.map(topic => topic._id);

    // Find the topics by their IDs
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean().exec();

    // Combine the user and topic information
    const playerAndStage = user.personalTopics.map(topic => {
      // const topicInfo = topics.find(t => t._id === topic._id);

    const stageNumber = parseInt(topic.stage.substring(1));
    const progress = stageNumber * 10;

    return {
      topicId: topic._id,
      topicName: topic.tName,
      progress: progress,
    };
    })

    res.json(playerAndStage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});
//topic analytics for a user 
router.get("/topic-stats/:playerId", async (req, res) => {
  try {
    const playerId = req.params.playerId;

    const stats = await Result.aggregate([
      {
        $match: { player: mongoose.Types.ObjectId(playerId) }
      },
      {
        $unwind: "$Options_Res"
      },
      {
        $lookup: {
          from: "questions",
          localField: "Options_Res.question_id",
          foreignField: "_id",
          as: "question"
        }
      },
      {
        $unwind: "$question"
      },
      {
        $lookup: {
          from: "difficulties",
          localField: "Options_Res.difficulty",
          foreignField: "_id",
          as: "difficulty"
        }
      },
      {
        $unwind: "$difficulty"
      },
      {
        $lookup: {
          from: "topics",
          localField: "question.topic",
          foreignField: "_id",
          as: "topic"
        }
      },
      {
        $unwind: "$topic"
      },
      {
        $group: {
          _id: {
            difficulty: "$Options_Res.difficulty",
            topic: "$topic.tName" // Group by the topic name instead of ID
          },
          correct: {
            $sum: {
              $cond: [
                { $eq: ["$Options_Res.IsCorrect", true] },
                1,
                0
              ]
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "difficulties",
          localField: "_id.difficulty",
          foreignField: "_id",
          as: "difficulty"
        }
      },
      {
        $unwind: "$difficulty"
      },
      {
        $project: {
          _id: 0,
          topic: "$_id.topic", // Rename the _id.topic field to topic
          difficulty: "$difficulty",
          correct: 1,
          total: 1
        }
      }
    ]);

    const statsObj = {};
    stats.forEach(stat => {
      const topicName = stat.topic;
      if (!statsObj[topicName]) {
        statsObj[topicName] = [];
      }
      statsObj[topicName].push({
        difficulty: stat.difficulty.dName,
        correct: stat.correct,
        total: stat.total
      });
    });

    res.json(statsObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



router.get("/question-stats/:playerId", async (req, res) => {
  try {
    const playerId = req.params.playerId;

    const stats = await Result.aggregate([
      { $match: { player: mongoose.Types.ObjectId(playerId) } },
      { $unwind: "$Options_Res" },
      {
        $lookup: {
          from: "difficulties",
          localField: "Options_Res.difficulty",
          foreignField: "_id",
          as: "difficulty",
        },
      },
      { $unwind: "$difficulty" },
      {
        $group: {
          _id: "$Options_Res.difficulty",
          correct: {
            $sum: {
              $cond: [{ $eq: ["$Options_Res.IsCorrect", true] }, 1, 0],
            },
          },
          incorrect: {
            $sum: {
              $cond: [{ $eq: ["$Options_Res.IsCorrect", false] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "difficulties",
          localField: "_id",
          foreignField: "_id",
          as: "difficulty",
        },
      },
      { $unwind: "$difficulty" },
      {
        $project: {
          _id: 0,
          difficulty: "$difficulty.dName",
          correct: 1,
          incorrect: 1,
          total: 1,
        },
      },
    ]);

    const statsObj = {};
    stats.forEach((stat) => {
      statsObj[stat.difficulty] = {
        correct: stat.correct,
        incorrect: stat.incorrect,
        total: stat.total,
      };
    });

    res.json(statsObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//------------------Generic Question Stats Below---------------
router.get("/question-stats", async(req, res) => {
    try {
      const stats = await Result.aggregate([
        {
          $unwind: "$Options_Res"
        },
        {
          $lookup: {
            from: "difficulties",
            localField: "Options_Res.difficulty",
            foreignField: "_id",
            as: "difficulty"
          }
        },
        {
          $unwind: "$difficulty"
        },
        {
          $group: {
            _id: "$Options_Res.difficulty",
            correct: {
              $sum: {
                $cond: [
                  { $eq: ["$Options_Res.IsCorrect", true] },
                  1,
                  0
                ]
              }
            },
            incorrect: {
              $sum: {
                $cond: [
                  { $eq: ["$Options_Res.IsCorrect", false] },
                  1,
                  0
                ]
              }
            },
            total: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "difficulties",
            localField: "_id",
            foreignField: "_id",
            as: "difficulty"
          }
        },
        {
          $unwind: "$difficulty"
        },
        {
          $project: {
            _id: 0,
            difficulty: "$difficulty.dName",
            correct: 1,
            incorrect: 1,
            total: 1
          }
        }
      ]);
  
      const statsObj = {};
      stats.forEach(stat => {
        statsObj[stat.difficulty] = {
          correct: stat.correct,
          incorrect: stat.incorrect,
          total: stat.total
        };
      });
  
      res.json(statsObj);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  
//------------------Ignore the Code Below------------------------------
// router.get("/question-stats", async(req, res) => {

//     const difficulty = await Difficulty.find()
//     let difficulties={
//       easy:"",
//       medium:"",
//       hard:"",
//     }
//     difficulty.map(item=>{
//       if(item.dName=="easy"){
//         difficulties.easy=item._id;
//       }
//       else if(item.dName=="medium"){
//         difficulties.medium=item._id;
//       }
//       else if(item.dName=="hard"){
//         difficulties.hard=item._id;
//       }
//     })
//   try {

//     const results = await Result.find();
//     const stats = {
//       [difficulties.easy]: { correct: 0, incorrect: 0, total: 0 },
//       [difficulties.medium]: { correct: 0, incorrect: 0, total: 0 },
//       [difficulties.hard]: { correct: 0, incorrect: 0, total: 0 },
//     };
//     results.forEach((result) => {
//       result.Options_Res.forEach((option) => {
//         const difficulty = option.difficulty.toString();
//         const isCorrect = option.IsCorrect;
//         stats[difficulty].total++;
//         if (isCorrect) {
//           stats[difficulty].correct++;
//         } else {
//           stats[difficulty].incorrect++;
//         }
//       });
//     });
//     res.json(stats);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
    
// })
  
//------------Generic Topic Stats below-------------------------
// router.get("/topic-stats", async(req, res) => {
//   try {
//     const stats = await Question.aggregate([
//       {
//         $lookup: {
//           from: "topics",
//           localField: "topic",
//           foreignField: "_id",
//           as: "topic"
//         }
//       },
//       {
//         $lookup: {
//           from: "difficulties",
//           localField: "difficulty",
//           foreignField: "_id",
//           as: "difficulty"
//         }
//       },
//       {
//         $unwind: "$topic"
//       },
//       {
//         $unwind: "$difficulty"
//       },
//       {
//         $group: {
//           _id: {
//             topic: "$topic.tName",
//             difficulty: "$difficulty.dName"
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $match: {
//           count: { $gte: 0 }
//         }
//       },
//       {
//         $group: {
//           _id: "$_id.topic",
//           stats: {
//             $push: {
//               difficulty: "$_id.difficulty",
//               count: "$count"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           topic: "$_id",
//           stats: {
//             $arrayToObject: {
//               $map: {
//                 input: "$stats",
//                 as: "stat",
//                 in: {
//                   k: "$$stat.difficulty",
//                   v: "$$stat.count"
//                 }
//               }
//             }
//           }
//         }
//       }
//     ]);

//     const result = {};
//     stats.forEach(stat => {
//       result[stat.topic] = stat.stats;
//     });

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

  //------------------------------------------------------------------
// router.get("/topic-stats", async(req, res) => {

//     const difficulty = await Difficulty.find()
//     let difficulties={
//       easy:"",
//       medium:"",
//       hard:"",
//     }
//     difficulty.map(item=>{
//       if(item.dName=="easy"){
//         difficulties.easy=item._id;
//       }
//       else if(item.dName=="medium"){
//         difficulties.medium=item._id;
//       }
//       else if(item.dName=="hard"){
//         difficulties.hard=item._id;
//       }
//     })
  
//     try {
//       const questions = await Question.find().populate('topic', 'tName').populate('difficulty', 'dName');
//       const stats = {};
  
//       for (const question of questions) {
//         const topicName = question.topic.tName;
//         const difficultyName = question.difficulty.dName;
  
//         if (!stats[topicName]) {
//           stats[topicName] = {
//             "easy": 0,
//             "medium": 0,
//             "hard": 0,
//           };
//         }
  
//         stats[topicName][difficultyName]++;
//       }
  
//       res.json(stats);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server Error' });
//     }
//   });
  

//------------------For radar chart ------------------------
router.get('/players/:id/topics-and-stages', async (req, res) => {
  const userId  = mongoose.Types.ObjectId(req.params.id);

  try {
    // Find the user by ID
    const user = await User.findById(userId).lean().exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

   
    const topicIds = user.personalTopics.map(topic => topic._id);

    // Find the topics by their IDs
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean().exec();

    // Combine the user and topic information
    const playerAndStage = user.personalTopics.map(topic => {
      // const topicInfo = topics.find(t => t._id === topic._id);

      return {
        topicId: topic._id,
        topicName: topic.tName,
        stage: topic.stage,
      };
    });

    res.json(playerAndStage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});
  
//------------Challenge Mode-----------------------//
//-------------------------------------------------//
//-------------------------------------------------//
//-------------------------------------------------//

//per player dougnut 
router.get('/multiplayerMatchResults/:playerId', async (req, res) => {

  const playerId = mongoose.Types.ObjectId(req.params.playerId);
  
  multiplayerResult.aggregate([
      // Match documents that contain the specified player ID
      { $match: { 'players': { $elemMatch: { [playerId]: { $exists: true } } } } },
      // Group the results by the winner field and calculate the count of games won and lost
      { $group: {
        _id: null, // Remove the grouping by 'winner' field
        gamesWon: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  
                  { $eq: ['$winner', playerId] } // Check if playerId is the winner
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        gamesLost: {
          $sum: {
            $cond: {
              if: {
                $and: [
                 
                  { $ne: ['$winner', playerId] } // Check if playerId is not the winner
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        totalGames: { $sum: 1 } 

      }},
      { $project: { _id: 0 } } // Exclude the _id field from the final output
    ], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving results');
      } else {
         
        res.json(results);
      }
    });  
});








//generic multiplayer pie chart
router.get('/multiplayerMatchResults', async (req, res) => {
  try {
    const users = await User.find();
    const playerResults = {};

    await Promise.all(users.map(async (user) => {
      const playerId = user._id;
      const playerName = user.firstName; // Assuming the player name field is 'name'

      try {
        const results = await multiplayerResult.aggregate([
          { $match: { 'players': { $elemMatch: { [playerId]: { $exists: true } } } } },
          {
            $group: {
              _id: playerName, // Group by player name
              gamesWon: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ['$winner', playerId] }
                      ]
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              gamesLost: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$winner', playerId] }
                      ]
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              totalGames: { $sum: 1 }
            }
          },
          { $project: { _id: 0, playerName: '$_id', gamesWon: 1, gamesLost: 1, totalGames: 1 } } // Include playerName field in the projection
        ]);

        playerResults[playerName] = results;
      } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving results');
      }
    }));

    res.json(playerResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving results');
  }
});





module.exports = router;