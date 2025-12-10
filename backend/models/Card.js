const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  position: { type: Number, required: true }
});

module.exports = mongoose.model('Card', CardSchema);