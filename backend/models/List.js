const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  position: { type: Number, required: true },
  color: { type: String, default: '#ebecf0' }
});

module.exports = mongoose.model('List', ListSchema);