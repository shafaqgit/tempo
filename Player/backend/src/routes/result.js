const express = require('express');
const axios = require("axios")
const router = express.Router();
const Result = require('../models/Result');
const MultiplayerResult = require('../models/multiplayerResult');


function calculateNextStage(totalScore, stage){
  let newStage = parseInt(stage.slice(1));  // extract the numeric part and convert it to a number
  
  
  if(totalScore > 20 && totalScore<=50){
    let walkStep=1;
    newStage=newStage+walkStep;  // increment the numeric part
    stage = "S" + newStage;  // combine the non-numeric part with the incremented numeric part to create the new string
  }

  else if(totalScore > 50 && totalScore<=80){
    let walkStep=2;
    newStage=newStage+walkStep;  // increment the numeric part
    stage = "S" + newStage;  // combine the non-numeric part with the incremented numeric part to create the new string

  }
  else if(totalScore > 80 && totalScore<=100){
    let walkStep=3;
    newStage=newStage+walkStep;  // increment the numeric part
    stage = "S" + newStage;  // combine the non-numeric part with the incremented numeric part to create the new string
  }

  return(stage)
}
// POST /results
router.post('/AddResult', async (req, res) => {
  try {
    
    const { player, optionsRes, stage, topicid } = req.body;
    let myScore = await axios.post('http://localhost:3000/api/calculateResult', {
      stage: stage,
      optionsRes: optionsRes
    });
    // const totalScore = await axios.get(`http://localhost:3000/api/calculateResult/${stage}/${optionsRes}`)
    
    
 
    const result = new Result({ player, Options_Res: optionsRes, Total_Score: parseInt(myScore.data.totalScore)});
    
    await result.save();
    const nextStage=calculateNextStage(parseInt(myScore.data.percentageScore),stage)
    const updatedPlayer= await axios.post('http://localhost:3000/api/updateSkill', {
      player: player,
      nextStage: nextStage,
      topicid:topicid
    });

    //player, nextStage, topicid 
   
    // res.status(200).send(updatedPlayer.data);
    res.json(updatedPlayer.data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/multiplayerResults', async (req, res) => {
  try {
    const multiplayerResult = new MultiplayerResult(req.body);
    const result = await multiplayerResult.save();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router