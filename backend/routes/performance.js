const express = require('express');
const User = require('../models/User');
const GameScore = require('../models/GameScore');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');

const router = express.Router();

// Get overall performance dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [user, performance, recentScores] = await Promise.all([
      User.findById(userId).select('-password'),
      Performance.findOne({ userId }),
      GameScore.find({ userId }).sort({ playedAt: -1 }).limit(20)
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate skill decay for all games
    if (performance) {
      const gameTypes = ['mathReflex', 'memoryBoost', 'logicPuzzles', 'wordBuilder', 'patternMatch', 'quickQuiz', 'colorHunt', 'shapeEscape'];
      for (const gameType of gameTypes) {
        if (performance.stats[gameType].lastPlayed) {
          const daysSincePlay = Math.floor(
            (new Date() - performance.stats[gameType].lastPlayed) / (1000 * 60 * 60 * 24)
          );
          performance.stats[gameType].skillDecay = daysSincePlay;
        }
      }
    }

    res.json({
      user: {
        username: user.username,
        skillLevels: user.skillLevels,
        memberSince: user.createdAt
      },
      stats: performance?.stats || null,
      weakAreas: performance?.weakAreas || [],
      recentGames: recentScores
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommendations based on performance
router.get('/recommendations', auth, async (req, res) => {
  try {
    const performance = await Performance.findOne({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);

    const recommendations = [];
    const gameTypes = ['mathReflex', 'memoryBoost', 'logicPuzzles', 'wordBuilder', 'patternMatch', 'quickQuiz', 'colorHunt', 'shapeEscape'];
    const gameNames = {
      mathReflex: 'Math Reflex',
      memoryBoost: 'Memory Boost',
      logicPuzzles: 'Logic Puzzles',
      wordBuilder: 'Word Builder',
      patternMatch: 'Pattern Match',
      quickQuiz: 'Quick Quiz',
      colorHunt: 'Color Hunt',
      shapeEscape: 'Shape Escape'
    };

    for (const gameType of gameTypes) {
      const stats = performance?.stats?.[gameType];
      const skillLevel = user?.skillLevels?.[gameType] || 1;

      // Never played
      if (!stats || stats.totalGamesPlayed === 0) {
        recommendations.push({
          gameType,
          gameName: gameNames[gameType],
          type: 'new',
          message: `Try ${gameNames[gameType]} to discover your potential!`,
          priority: 2
        });
        continue;
      }

      // Skill decay
      if (stats.skillDecay >= 7) {
        recommendations.push({
          gameType,
          gameName: gameNames[gameType],
          type: 'decay',
          message: `You haven't played ${gameNames[gameType]} in ${stats.skillDecay} days. Practice to maintain your skills!`,
          priority: Math.min(5, Math.floor(stats.skillDecay / 7) + 2)
        });
      }

      // Low accuracy
      if (stats.averageAccuracy < 60 && stats.totalGamesPlayed >= 3) {
        recommendations.push({
          gameType,
          gameName: gameNames[gameType],
          type: 'accuracy',
          message: `Your accuracy in ${gameNames[gameType]} is ${Math.round(stats.averageAccuracy)}%. Focus on precision!`,
          priority: 4
        });
      }

      // High performer - challenge
      if (stats.averageAccuracy >= 85 && skillLevel < 10) {
        recommendations.push({
          gameType,
          gameName: gameNames[gameType],
          type: 'challenge',
          message: `You're doing great in ${gameNames[gameType]}! Ready for a higher challenge?`,
          priority: 1
        });
      }

      // Streak encouragement
      if (stats.currentStreak >= 3) {
        recommendations.push({
          gameType,
          gameName: gameNames[gameType],
          type: 'streak',
          message: `Amazing ${stats.currentStreak}-day streak in ${gameNames[gameType]}! Keep it going!`,
          priority: 0
        });
      }
    }

    // Sort by priority (higher priority first)
    recommendations.sort((a, b) => b.priority - a.priority);

    res.json(recommendations.slice(0, 5));
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress chart data
router.get('/chart-data', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scores = await GameScore.find({
      userId,
      playedAt: { $gte: startDate }
    }).sort({ playedAt: 1 });

    // Group by date and game type
    const chartData = {};
    
    scores.forEach(score => {
      const dateKey = score.playedAt.toISOString().split('T')[0];
      
      if (!chartData[dateKey]) {
        chartData[dateKey] = {
          date: dateKey,
          mathReflex: { scores: [], accuracy: [] },
          memoryBoost: { scores: [], accuracy: [] },
          logicPuzzles: { scores: [], accuracy: [] }
        };
      }
      
      const accuracy = score.totalQuestions > 0 
        ? (score.correctAnswers / score.totalQuestions) * 100 
        : 0;
      
      chartData[dateKey][score.gameType].scores.push(score.score);
      chartData[dateKey][score.gameType].accuracy.push(accuracy);
    });

    // Calculate averages
    const result = Object.values(chartData).map(day => ({
      date: day.date,
      mathReflex: {
        avgScore: avg(day.mathReflex.scores),
        avgAccuracy: avg(day.mathReflex.accuracy),
        gamesPlayed: day.mathReflex.scores.length
      },
      memoryBoost: {
        avgScore: avg(day.memoryBoost.scores),
        avgAccuracy: avg(day.memoryBoost.accuracy),
        gamesPlayed: day.memoryBoost.scores.length
      },
      logicPuzzles: {
        avgScore: avg(day.logicPuzzles.scores),
        avgAccuracy: avg(day.logicPuzzles.accuracy),
        gamesPlayed: day.logicPuzzles.scores.length
      }
    }));

    res.json(result);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function avg(arr) {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

module.exports = router;
