// Maze Runner - Solve interactive mazes
class MazeRunnerGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 5;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.maze = [];
        this.playerPos = { x: 0, y: 0 };
        this.exitPos = { x: 0, y: 0 };
        this.mazeSize = 7;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('mazeRunner');
            this.totalRounds = this.config.roundsCount || 5;
            this.timeLeft = this.config.timeLimit || 60;
            this.mazeSize = 5 + Math.floor((this.config.difficulty || 1) / 2);
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generateMaze();
            this.setupControls();
        } catch (error) {
            console.error('Failed to init Maze Runner:', error);
            this.config = { difficulty: 1, timeLimit: 60, roundsCount: 5 };
            this.mazeSize = 5;
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generateMaze();
            this.setupControls();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🏃‍♂️ Maze Runner</h2>
                    <div class="game-info">
                        <span class="timer">⏱️ <span id="timer">${this.formatTime(this.timeLeft)}</span></span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Maze <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">Navigate to the exit 🚪 using arrow keys or buttons!</div>
                    <div id="maze-grid" class="maze-grid"></div>
                    <div class="maze-controls">
                        <button class="control-btn" onclick="window.currentGame.move('up')">⬆️</button>
                        <div class="control-row">
                            <button class="control-btn" onclick="window.currentGame.move('left')">⬅️</button>
                            <button class="control-btn" onclick="window.currentGame.move('down')">⬇️</button>
                            <button class="control-btn" onclick="window.currentGame.move('right')">➡️</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMaze() {
        const size = this.mazeSize;
        // Initialize maze with walls
        this.maze = Array(size).fill(null).map(() => Array(size).fill(1));
        
        // Generate maze using recursive backtracking
        this.carveMaze(1, 1);
        
        // Set player start and exit positions
        this.playerPos = { x: 1, y: 1 };
        this.maze[1][1] = 0;
        
        // Find a good exit position
        this.exitPos = { x: size - 2, y: size - 2 };
        this.maze[size - 2][size - 2] = 0;
        
        // Ensure path to exit
        this.ensurePath();
        
        this.renderMaze();
    }

    carveMaze(x, y) {
        const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        this.shuffleArray(directions);
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx > 0 && nx < this.mazeSize - 1 && ny > 0 && ny < this.mazeSize - 1 && this.maze[ny][nx] === 1) {
                this.maze[y + dy/2][x + dx/2] = 0;
                this.maze[ny][nx] = 0;
                this.carveMaze(nx, ny);
            }
        }
    }

    ensurePath() {
        // Create a clear path from start to exit
        let x = 1, y = 1;
        while (x < this.exitPos.x || y < this.exitPos.y) {
            this.maze[y][x] = 0;
            if (Math.random() > 0.5 && x < this.exitPos.x) {
                x++;
            } else if (y < this.exitPos.y) {
                y++;
            } else {
                x++;
            }
        }
        this.maze[this.exitPos.y][this.exitPos.x] = 0;
    }

    renderMaze() {
        const gridEl = document.getElementById('maze-grid');
        gridEl.style.gridTemplateColumns = `repeat(${this.mazeSize}, 1fr)`;
        
        let html = '';
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                let cellClass = 'maze-cell';
                let content = '';
                
                if (x === this.playerPos.x && y === this.playerPos.y) {
                    cellClass += ' player';
                    content = '🏃';
                } else if (x === this.exitPos.x && y === this.exitPos.y) {
                    cellClass += ' exit';
                    content = '🚪';
                } else if (this.maze[y][x] === 1) {
                    cellClass += ' wall';
                } else {
                    cellClass += ' path';
                }
                
                html += `<div class="${cellClass}">${content}</div>`;
            }
        }
        gridEl.innerHTML = html;
    }

    setupControls() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(e) {
        const keyMap = {
            'ArrowUp': 'up', 'ArrowDown': 'down',
            'ArrowLeft': 'left', 'ArrowRight': 'right',
            'w': 'up', 's': 'down', 'a': 'left', 'd': 'right'
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            this.move(keyMap[e.key]);
        }
    }

    move(direction) {
        const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        const [dx, dy] = moves[direction];
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        // Check bounds and walls
        if (newX >= 0 && newX < this.mazeSize && newY >= 0 && newY < this.mazeSize && this.maze[newY][newX] === 0) {
            this.playerPos = { x: newX, y: newY };
            this.renderMaze();
            
            // Check if reached exit
            if (newX === this.exitPos.x && newY === this.exitPos.y) {
                const timeBonus = Math.max(0, this.timeLeft * 2);
                const points = (100 + timeBonus) * (this.config?.difficulty || 1);
                this.score += points;
                this.correctAnswers++;
                document.getElementById('score').textContent = this.score;
                this.showFeedback('Maze Complete! 🎉', true);
                setTimeout(() => this.nextRound(), 1000);
            }
        }
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound >= this.totalRounds) {
            this.endGame();
            return;
        }
        document.getElementById('round').textContent = this.currentRound + 1;
        this.mazeSize = Math.min(this.mazeSize + 1, 11);
        this.resetTimer();
        this.generateMaze();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.showFeedback('Time\'s up!', false);
                this.nextRound();
            }
        }, 1000);
    }

    resetTimer() {
        this.timeLeft = this.config?.timeLimit || 60;
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    showFeedback(message, isCorrect) {
        const existing = document.querySelector('.feedback-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1500);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        document.removeEventListener('keydown', this.handleKeyPress);
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);

        try {
            const result = await API.submitScore({
                gameType: 'mazeRunner',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.totalRounds,
                timeTaken
            });
            this.showResults(result, accuracy);
        } catch (error) {
            this.showResults(null, accuracy);
        }
    }

    showResults(result, accuracy) {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-results">
                    <h2>🎯 Game Complete!</h2>
                    <div class="results-stats">
                        <div class="result-item"><span class="result-value">${this.score}</span><span class="result-label">Score</span></div>
                        <div class="result-item"><span class="result-value">${accuracy}%</span><span class="result-label">Accuracy</span></div>
                        <div class="result-item"><span class="result-value">${this.correctAnswers}/${this.totalRounds}</span><span class="result-label">Mazes</span></div>
                    </div>
                    ${result ? `<div class="difficulty-change ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? 'up' : 'down') : 'same'}">
                        ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? '🎉 Level Up!' : '📉 Level adjusted') : '➡️ Keep practicing!'} 
                        Level: ${result.previousDifficulty} → ${result.newDifficulty}
                    </div>` : ''}
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new MazeRunnerGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}

window.MazeRunnerGame = MazeRunnerGame;
