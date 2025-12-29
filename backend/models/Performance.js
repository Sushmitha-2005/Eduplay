const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Overall statistics per game type
  stats: {
    mathReflex: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    memoryBoost: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    logicPuzzles: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    wordBuilder: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    patternMatch: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    quickQuiz: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    colorHunt: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    },
    shapeEscape: {
      totalGamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date },
      skillDecay: { type: Number, default: 0 }
    }
  },
  // Weekly progress data for charts
  weeklyProgress: [{
    weekStart: Date,
    mathReflex: { gamesPlayed: Number, averageScore: Number },
    memoryBoost: { gamesPlayed: Number, averageScore: Number },
    logicPuzzles: { gamesPlayed: Number, averageScore: Number }
  }],
  // Areas needing improvement
  weakAreas: [{
    gameType: String,
    reason: String,
    priority: { type: Number, default: 1 }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Performance', performanceSchema);
