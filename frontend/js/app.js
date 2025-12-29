// Main Application Logic

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Section navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    // Show selected section
    switch(section) {
        case 'home':
            document.getElementById('homeSection').classList.remove('hidden');
            document.querySelector('[onclick="showSection(\'home\')"]').classList.add('active');
            loadHomeData();
            break;
        case 'games':
            document.getElementById('gamesSection').classList.remove('hidden');
            document.querySelector('[onclick="showSection(\'games\')"]').classList.add('active');
            updateSkillLevelDisplay();
            break;
        case 'dashboard':
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.querySelector('[onclick="showSection(\'dashboard\')"]').classList.add('active');
            loadDashboard();
            break;
    }
}

// Load home section data
async function loadHomeData() {
    try {
        const [recommendations, dashboardData] = await Promise.all([
            PerformanceAPI.getRecommendations(),
            PerformanceAPI.getDashboard()
        ]);

        renderRecommendations(recommendations);
        renderQuickStats(dashboardData);
    } catch (error) {
        console.error('Home data load error:', error);
        // Show default stats if API fails
        renderQuickStats({ stats: {}, weakAreas: [] });
    }
}

// Render recommendations on home page
function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendationsList');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = `
            <div class="recommendation-card">
                <span class="recommendation-icon">🎮</span>
                <div>
                    <strong>Start Playing!</strong>
                    <p>Try all games to get personalized recommendations.</p>
                </div>
            </div>
        `;
        return;
    }

    const icons = {
        new: '🆕',
        decay: '⏰',
        accuracy: '🎯',
        challenge: '🚀',
        streak: '🔥'
    };

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card ${rec.type}" onclick="startGameFromRecommendation('${rec.gameType}')">
            <span class="recommendation-icon">${icons[rec.type] || '💡'}</span>
            <div>
                <strong>${rec.gameName}</strong>
                <p>${rec.message}</p>
            </div>
        </div>
    `).join('');
}

// Start game from recommendation click
function startGameFromRecommendation(gameType) {
    showSection('games');
    setTimeout(() => startGame(gameType), 300);
}

// Render quick stats on home page
function renderQuickStats(data) {
    const container = document.getElementById('quickStatsGrid');
    
    let totalGames = 0;
    let totalScore = 0;
    let avgAccuracy = 0;
    let accCount = 0;

    if (data.stats) {
        Object.values(data.stats).forEach(s => {
            totalGames += s.totalGamesPlayed || 0;
            totalScore += s.totalScore || 0;
            if (s.averageAccuracy > 0) {
                avgAccuracy += s.averageAccuracy;
                accCount++;
            }
        });
    }

    avgAccuracy = accCount > 0 ? Math.round(avgAccuracy / accCount) : 0;

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalGames}</div>
            <div class="stat-label">Games Played</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalScore.toLocaleString()}</div>
            <div class="stat-label">Total Score</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgAccuracy}%</div>
            <div class="stat-label">Avg Accuracy</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.weakAreas?.length || 0}</div>
            <div class="stat-label">Areas to Improve</div>
        </div>
    `;
}

// Start a game
function startGame(gameType) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById('gamePlaySection').classList.remove('hidden');
    
    document.getElementById('gameScore').textContent = 'Score: 0';
    document.getElementById('gameTimer').textContent = 'Time: 00:00';

    // Use game area for new games
    const gameArea = document.getElementById('gameArea');

    switch(gameType) {
        case 'mathReflex':
            mathGame = new MathReflexGame();
            mathGame.start();
            break;
        case 'memoryBoost':
            memoryGame = new MemoryBoostGame();
            memoryGame.start();
            break;
        case 'logicPuzzles':
            logicGame = new LogicPuzzlesGame();
            logicGame.start();
            break;
        case 'wordBuilder':
            wordGame = new WordBuilderGame();
            wordGame.start();
            break;
        case 'patternMatch':
            patternGame = new PatternMatchGame();
            patternGame.start();
            break;
        case 'quickQuiz':
            quizGame = new QuickQuizGame();
            quizGame.start();
            break;
        case 'colorHunt':
            colorGame = new ColorHuntGame();
            colorGame.start();
            break;
        case 'shapeEscape':
            shapeGame = new ShapeEscapeGame();
            shapeGame.start();
            break;
        case 'numberLink':
            window.currentGame = new NumberLinkGame('gameArea');
            window.currentGame.init();
            break;
        case 'mazeRunner':
            window.currentGame = new MazeRunnerGame('gameArea');
            window.currentGame.init();
            break;
        case 'sudokuSolver':
            window.currentGame = new SudokuSolverGame('gameArea');
            window.currentGame.init();
            break;
        case 'mathLadder':
            window.currentGame = new MathLadderGame('gameArea');
            window.currentGame.init();
            break;
        case 'logicGrid':
            window.currentGame = new LogicGridGame('gameArea');
            window.currentGame.init();
            break;
        case 'wordSearch':
            window.currentGame = new WordSearchGame('gameArea');
            window.currentGame.init();
            break;
        case 'sequenceSolver':
            window.currentGame = new SequenceSolverGame('gameArea');
            window.currentGame.init();
            break;
        case 'emojiPairs':
            window.currentGame = new EmojiPairsGame('gameArea');
            window.currentGame.init();
            break;
        case 'triviaBlast':
            window.currentGame = new TriviaBlastGame('gameArea');
            window.currentGame.init();
            break;
        case 'colorPatternQuiz':
            window.currentGame = new ColorPatternQuizGame('gameArea');
            window.currentGame.init();
            break;
        case 'puzzleBlocks':
            window.currentGame = new PuzzleBlocksGame('gameArea');
            window.currentGame.init();
            break;
        default:
            gameArea.innerHTML = `<h3>Game "${gameType}" coming soon!</h3>`;
    }
}

// Exit game and return to games section
function exitGame() {
    // Clear any running timers
    if (typeof mathGame !== 'undefined' && mathGame.timerInterval) clearInterval(mathGame.timerInterval);
    if (typeof logicGame !== 'undefined' && logicGame.timerInterval) clearInterval(logicGame.timerInterval);
    if (typeof wordGame !== 'undefined' && wordGame.timerInterval) clearInterval(wordGame.timerInterval);
    if (typeof quizGame !== 'undefined' && quizGame.timerInterval) clearInterval(quizGame.timerInterval);
    if (typeof colorGame !== 'undefined' && colorGame.timerInterval) clearInterval(colorGame.timerInterval);
    if (typeof shapeGame !== 'undefined' && shapeGame.timerInterval) clearInterval(shapeGame.timerInterval);
    
    showSection('games');
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (checkAuth()) {
        showApp();
    } else {
        // Show auth container, hide nav links
        document.getElementById('navLinks').classList.add('hidden');
    }
});

// Refresh user data from server
async function refreshUserData() {
    try {
        const user = await AuthAPI.getCurrentUser();
        currentUser = user;
        localStorage.setItem('eduplay_user', JSON.stringify({
            id: user._id,
            username: user.username,
            email: user.email,
            skillLevels: user.skillLevels
        }));
        updateSkillLevelDisplay();
    } catch (error) {
        console.error('Failed to refresh user data:', error);
    }
}

// App object for external access
window.app = {
    showDashboard: () => showSection('games'),
    showSection: showSection
};
