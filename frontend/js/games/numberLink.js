// Number Link - Connect numbers in sequence
class NumberLinkGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 8;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.grid = [];
        this.nextNumber = 1;
        this.maxNumber = 5;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('numberLink');
            this.totalRounds = this.config.roundsCount || 8;
            this.timeLeft = this.config.timeLimit || 45;
            this.maxNumber = 3 + Math.floor((this.config.difficulty || 1) / 2);
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generatePuzzle();
        } catch (error) {
            console.error('Failed to init Number Link:', error);
            this.config = { difficulty: 1, timeLimit: 45, roundsCount: 8 };
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generatePuzzle();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🔢 Number Link</h2>
                    <div class="game-info">
                        <span class="timer">⏱️ <span id="timer">${this.formatTime(this.timeLeft)}</span></span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Round <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">Connect numbers 1 to ${this.maxNumber} in order!</div>
                    <div id="number-grid" class="number-grid"></div>
                    <div class="progress-info">Next number: <span id="next-num" class="next-number">1</span></div>
                </div>
            </div>
        `;
    }

    generatePuzzle() {
        const difficulty = this.config?.difficulty || 1;
        this.maxNumber = Math.min(3 + Math.floor(difficulty / 2), 9);
        const gridSize = Math.min(4 + Math.floor(difficulty / 3), 6);
        this.nextNumber = 1;
        
        // Create grid with numbers
        const totalCells = gridSize * gridSize;
        this.grid = Array(totalCells).fill(0);
        
        // Place numbers randomly
        const positions = [];
        for (let i = 0; i < totalCells; i++) positions.push(i);
        this.shuffleArray(positions);
        
        for (let num = 1; num <= this.maxNumber; num++) {
            this.grid[positions[num - 1]] = num;
        }
        
        const gridEl = document.getElementById('number-grid');
        gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        gridEl.innerHTML = this.grid.map((num, i) => `
            <div class="number-cell ${num ? 'has-number' : ''}" data-index="${i}" onclick="window.currentGame.clickCell(${i})">
                ${num || ''}
            </div>
        `).join('');
        
        document.getElementById('next-num').textContent = '1';
    }

    clickCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        const cellValue = this.grid[index];
        
        if (cellValue === this.nextNumber) {
            cell.classList.add('selected', 'correct');
            this.nextNumber++;
            document.getElementById('next-num').textContent = this.nextNumber;
            
            if (this.nextNumber > this.maxNumber) {
                // Completed sequence
                const points = this.maxNumber * 50 * (this.config?.difficulty || 1);
                this.score += points;
                this.correctAnswers++;
                document.getElementById('score').textContent = this.score;
                this.showFeedback('Perfect! 🎉', true);
                setTimeout(() => this.nextRound(), 1000);
            }
        } else if (cellValue > 0) {
            cell.classList.add('wrong');
            this.showFeedback(`Find ${this.nextNumber} first!`, false);
            setTimeout(() => cell.classList.remove('wrong'), 500);
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
        this.resetTimer();
        this.generatePuzzle();
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
        this.timeLeft = this.config?.timeLimit || 45;
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
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);

        try {
            const result = await API.submitScore({
                gameType: 'numberLink',
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
                        <div class="result-item"><span class="result-value">${this.correctAnswers}/${this.totalRounds}</span><span class="result-label">Correct</span></div>
                    </div>
                    ${result ? `<div class="difficulty-change ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? 'up' : 'down') : 'same'}">
                        ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? '🎉 Level Up!' : '📉 Level adjusted') : '➡️ Keep practicing!'} 
                        Level: ${result.previousDifficulty} → ${result.newDifficulty}
                    </div>` : ''}
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new NumberLinkGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}

window.NumberLinkGame = NumberLinkGame;
