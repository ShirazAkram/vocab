const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: String,
  phonetic: String,
  examples: [String],
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
