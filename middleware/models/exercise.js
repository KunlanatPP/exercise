const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  model_version: { type: String, required: true },
  accuracy: { type: Number, required: true },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
