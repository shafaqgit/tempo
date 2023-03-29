const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({

    stageName:{
        type:String,
        required:true

    },
    skillType:{
        type:String,
        required:true
    },

    weightage: {
        type: [Number],
        required: true,
        
      },
      numberOfQuestions: {
        type: [Number],
        required: true,
        
      },
      total: {
        type: Number,
        required: true
      }
});

module.exports = mongoose.model('Stage', StageSchema);