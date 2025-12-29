const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['mathReflex', 'memoryBoost', 'logicPuzzles', 'wordBuilder', 'patternMatch', 'quickQuiz', 'colorHunt', 'shapeEscape'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
gameScoreSchema.index({ userId: 1, gameType: 1, playedAt: -1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);
