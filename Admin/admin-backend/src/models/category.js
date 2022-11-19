const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  cName: {
    type: String,
    required:true,
    unique: true
}
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Category', CategorySchema);