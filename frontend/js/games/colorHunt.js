// Color Hunt Game - Fixed with fallback defaults
class ColorHuntGame {
    constructor() {
        this.config = null;
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.targetColor = null;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('colorHunt');
        } catch (error) {
            console.log('Using default config for Color Hunt');
            this.config = { difficulty: 1, rounds: 10, timeLimit: 60 };
        }
        this.config.rounds = this.config.rounds || 10;
        this.config.timeLimit = this.config.timeLimit || 60;
        this.config.difficulty = this.config.difficulty || 1;
        this.resetGame();
        this.renderGame();
        this.nextRound();
    }

    resetGame() {
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    renderGame() {
        document.getElementById('gameArea').innerHTML = `
            <div class="color-game-container">
                <div class="word-instruction">Find the matching color!</div>
                <div id="targetColorDisplay" style="width:80px;height:80px;border-radius:12px;margin:1rem auto;border:3px solid #333;"></div>
                <div class="color-options" id="colorOptions"></div>
                <div class="progress-info" id="colorProgress">Round 0 / ${this.config.rounds}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🌈 Color Hunt';
    }

    nextRound() {
        if (this.currentRound >= this.config.rounds) {
            this.endGame();
            return;
        }
        this.currentRound++;
        this.generateColors();
        document.getElementById('colorProgress').textContent = `Round ${this.currentRound} / ${this.config.rounds}`;
        this.startTimer();
    }

    generateColors() {
        const colors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', 
            '#e67e22', '#1abc9c', '#34495e', '#e91e63', '#00bcd4',
            '#8bc34a', '#ff5722', '#607d8b', '#795548', '#9c27b0'
        ];
        const shuffled = colors.sort(() => Math.random() - 0.5);
        this.targetColor = shuffled[0];
        
        document.getElementById('targetColorDisplay').style.backgroundColor = this.targetColor;
        
        const optionColors = [this.targetColor, ...shuffled.slice(1, 5)].sort(() => Math.random() - 0.5);
        document.getElementById('colorOptions').innerHTML = optionColors.map(color => 
            `<div class="color-option" style="background:${color}" onclick="colorGame.checkAnswer('${color}')"></div>`
        ).join('');
    }

    startTimer() {
        let timeLeft = this.config.timeLimit;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.updateTimer(timeLeft);
        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.updateTimer(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.checkAnswer(null);
            }
        }, 1000);
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('gameTimer').textContent = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    checkAnswer(color) {
        clearInterval(this.timerInterval);
        const options = document.querySelectorAll('.color-option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (opt.style.backgroundColor === this.hexToRgb(this.targetColor)) {
                opt.style.border = '4px solid #00E676';
            } else if (opt.style.backgroundColor === this.hexToRgb(color)) {
                opt.style.border = '4px solid #FF5252';
            }
        });
        if (color === this.targetColor) {
            this.correctAnswers++;
            this.score += 80 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        }
        setTimeout(() => this.nextRound(), 1000);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return hex;
        return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
    }

    async endGame() {
        clearInterval(this.timerInterval);
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.rounds) * 100);
        try { await GamesAPI.submitScore({ gameType: 'colorHunt', score: this.score, correctAnswers: this.correctAnswers, totalQuestions: this.config.rounds, timeTaken: totalTime }); } catch (e) {}
        document.getElementById('gameArea').innerHTML = `
            <div class="game-results">
                <h2>🌈 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('colorHunt')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let colorGame = new ColorHuntGame();
