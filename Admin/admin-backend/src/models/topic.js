const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  tName: {
    type: String,
    required:true,
    unique: true
}
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Topic', TopicSchema);