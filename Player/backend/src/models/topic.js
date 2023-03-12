const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  tName: {
    type: String,
    required:true,
    unique: true
},
locked:{
  type:Boolean,
  default:true,
  
}, 
// threshold{
//     type:Number
// }

assessmentCompleted:{
  type:Boolean,
  default:false,
},
highestScore:{
  type:Number,
  default:0,

},
averageScore:{
  type:Number,
  default:0,
}
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Topic', TopicSchema);