const express = require('express');
const User = require('../models/User');
const GameScore = require('../models/GameScore');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');

const router = express.Router();

// Adaptive Difficulty Engine
const calculateNewDifficulty = (currentDifficulty, accuracy, avgTime, gameType) => {
  let newDifficulty = currentDifficulty;
  
  // Performance thresholds
  const highPerformance = accuracy >= 0.85 && avgTime < 5;
  const goodPerformance = accuracy >= 0.7 && avgTime < 8;
  const poorPerformance = accuracy < 0.5 || avgTime > 15;
  
  if (highPerformance && currentDifficulty < 10) {
    newDifficulty = Math.min(10, currentDifficulty + 1);
  } else if (goodPerformance && currentDifficulty < 10) {
    newDifficulty = Math.min(10, currentDifficulty + 0.5);
  } else if (poorPerformance && currentDifficulty > 1) {
    newDifficulty = Math.max(1, currentDifficulty - 1);
  }
  
  return Math.round(newDifficulty * 10) / 10;
};

// Get game config with current difficulty
router.get('/config/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const difficulty = user.skillLevels[gameType] || 1;
    
    // Generate game configuration based on difficulty
    let config = { difficulty };
    
    switch (gameType) {
      case 'mathReflex':
        config = {
          ...config,
          timeLimit: Math.max(10, 30 - difficulty * 2), // seconds per question
          questionsCount: 5 + Math.floor(difficulty / 2),
          operations: difficulty < 3 ? ['+', '-'] : 
                     difficulty < 6 ? ['+', '-', '*'] : 
                     ['+', '-', '*', '/'],
          maxNumber: 10 + difficulty * 10
        };
        break;
      case 'memoryBoost':
        config = {
          ...config,
          gridSize: Math.min(6, 3 + Math.floor(difficulty / 3)),
          sequenceLength: 3 + Math.floor(difficulty / 2),
          displayTime: Math.max(500, 2000 - difficulty * 150), // ms
          rounds: 5
        };
        break;
      case 'logicPuzzles':
        config = {
          ...config,
          puzzleComplexity: difficulty,
          timeLimit: Math.max(30, 120 - difficulty * 8),
          puzzlesCount: 3 + Math.floor(difficulty / 3)
        };
        break;
      case 'wordBuilder':
        config = {
          ...config,
          wordLength: Math.min(8, 3 + Math.floor(difficulty / 2)),
          timeLimit: Math.max(20, 60 - difficulty * 4),
          roundsCount: 5 + Math.floor(difficulty / 3)
        };
        break;
      case 'patternMatch':
        config = {
          ...config,
          patternLength: 3 + Math.floor(difficulty / 2),
          displayTime: Math.max(500, 2000 - difficulty * 150),
          roundsCount: 5 + Math.floor(difficulty / 3),
          patternTypes: difficulty < 4 ? ['shapes'] : difficulty < 7 ? ['shapes', 'colors'] : ['shapes', 'colors', 'numbers']
        };
        break;
      case 'quickQuiz':
        config = {
          ...config,
          timePerQuestion: Math.max(10, 30 - difficulty * 2),
          questionsCount: 5 + Math.floor(difficulty / 2),
          categories: difficulty < 4 ? ['general'] : difficulty < 7 ? ['general', 'science'] : ['general', 'science', 'math', 'history']
        };
        break;
      case 'colorHunt':
        config = {
          ...config,
          roundsCount: 5 + Math.floor(difficulty / 2),
          gridSize: Math.min(4 + Math.floor(difficulty / 3), 6),
          timeLimit: Math.max(5, 15 - difficulty)
        };
        break;
      case 'shapeEscape':
        config = {
          ...config,
          roundsCount: 5 + Math.floor(difficulty / 2),
          puzzleComplexity: difficulty,
          timeLimit: Math.max(5, 20 - difficulty)
        };
        break;
    }
    
    res.json(config);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit game score
router.post('/score', auth, async (req, res) => {
  try {
    const { gameType, score, correctAnswers, totalQuestions, timeTaken } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDifficulty = user.skillLevels[gameType] || 1;
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    const avgTimePerQuestion = totalQuestions > 0 ? timeTaken / totalQuestions : 0;

    // Save game score
    const gameScore = new GameScore({
      userId: user._id,
      gameType,
      score,
      difficulty: currentDifficulty,
      correctAnswers,
      totalQuestions,
      timeTaken
    });
    await gameScore.save();

    // Calculate new difficulty
    const newDifficulty = calculateNewDifficulty(currentDifficulty, accuracy, avgTimePerQuestion, gameType);
    
    // Update user skill level
    user.skillLevels[gameType] = newDifficulty;
    await user.save();

    // Update performance stats
    await updatePerformanceStats(user._id, gameType, score, accuracy, timeTaken);

    res.json({
      message: 'Score saved successfully',
      previousDifficulty: currentDifficulty,
      newDifficulty,
      accuracy: Math.round(accuracy * 100),
      difficultyChanged: newDifficulty !== currentDifficulty
    });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update performance stats
async function updatePerformanceStats(userId, gameType, score, accuracy, timeTaken) {
  let performance = await Performance.findOne({ userId });
  
  if (!performance) {
    performance = new Performance({ userId });
  }

  const stats = performance.stats[gameType];
  stats.totalGamesPlayed += 1;
  stats.totalScore += score;
  stats.averageAccuracy = ((stats.averageAccuracy * (stats.totalGamesPlayed - 1)) + accuracy * 100) / stats.totalGamesPlayed;
  stats.averageTime = ((stats.averageTime * (stats.totalGamesPlayed - 1)) + timeTaken) / stats.totalGamesPlayed;
  stats.bestScore = Math.max(stats.bestScore, score);
  stats.lastPlayed = new Date();
  stats.skillDecay = 0;
  
  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (stats.lastPlayed && stats.lastPlayed >= yesterday) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }

  // Update weak areas
  await updateWeakAreas(performance);
  
  performance.updatedAt = new Date();
  await performance.save();
}

// Helper to identify weak areas
async function updateWeakAreas(performance) {
  const weakAreas = [];
  const gameTypes = ['mathReflex', 'memoryBoost', 'logicPuzzles', 'wordBuilder', 'patternMatch', 'quickQuiz', 'colorHunt', 'shapeEscape'];
  
  for (const gameType of gameTypes) {
    const stats = performance.stats[gameType];
    
    // Check for skill decay (not played in 7+ days)
    if (stats.lastPlayed) {
      const daysSincePlay = Math.floor((new Date() - stats.lastPlayed) / (1000 * 60 * 60 * 24));
      stats.skillDecay = daysSincePlay;
      
      if (daysSincePlay >= 7) {
        weakAreas.push({
          gameType,
          reason: `Not practiced for ${daysSincePlay} days`,
          priority: Math.min(5, Math.floor(daysSincePlay / 7))
        });
      }
    }
    
    // Check for low accuracy
    if (stats.totalGamesPlayed >= 3 && stats.averageAccuracy < 60) {
      weakAreas.push({
        gameType,
        reason: `Low accuracy (${Math.round(stats.averageAccuracy)}%)`,
        priority: Math.ceil((60 - stats.averageAccuracy) / 10)
      });
    }
  }
  
  performance.weakAreas = weakAreas;
}

// Get recent scores
router.get('/history/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const scores = await GameScore.find({
      userId: req.user.userId,
      gameType
    })
    .sort({ playedAt: -1 })
    .limit(limit);
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
