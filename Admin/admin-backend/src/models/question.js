const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionContent: {
        type: String,
        required:true,
    },
    correctAnswer: {
        type: String,
        required:true,
    },
    options: [],
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);