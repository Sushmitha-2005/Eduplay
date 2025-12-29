// Memory Boost Game - Fixed with fallback defaults
class MemoryBoostGame {
    constructor() {
        this.config = null;
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.sequence = [];
        this.playerSequence = [];
        this.isShowingSequence = false;
        this.canClick = false;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('memoryBoost');
        } catch (error) {
            console.log('Using default config for Memory Boost');
            this.config = {
                difficulty: 1,
                gridSize: 3,
                rounds: 5,
                sequenceLength: 3,
                displayTime: 500
            };
        }
        
        // Ensure all config values exist
        this.config.gridSize = this.config.gridSize || 3;
        this.config.rounds = this.config.rounds || 5;
        this.config.sequenceLength = this.config.sequenceLength || 3;
        this.config.displayTime = this.config.displayTime || 500;
        this.config.difficulty = this.config.difficulty || 1;
        
        this.resetGame();
        this.renderGame();
        setTimeout(() => this.nextRound(), 1000);
    }

    resetGame() {
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        this.sequence = [];
        this.playerSequence = [];
    }

    renderGame() {
        const gameArea = document.getElementById('gameArea');
        const gridSize = this.config.gridSize;
        
        let gridHTML = '';
        for (let i = 0; i < gridSize * gridSize; i++) {
            gridHTML += `<div class="memory-cell" data-index="${i}" onclick="memoryGame.cellClick(${i})"></div>`;
        }

        gameArea.innerHTML = `
            <div class="memory-game-container">
                <div class="memory-instruction" id="memoryInstruction">Watch the sequence...</div>
                <div class="memory-grid" id="memoryGrid" style="grid-template-columns: repeat(${gridSize}, 80px);">
                    ${gridHTML}
                </div>
                <div class="progress-info" id="memoryProgress">
                    Round 0 / ${this.config.rounds}
                </div>
            </div>
        `;
        
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🧠 Memory Boost';
        document.getElementById('gameScore').textContent = `Score: ${this.score}`;
    }

    nextRound() {
        if (this.currentRound >= this.config.rounds) {
            this.endGame();
            return;
        }

        this.currentRound++;
        this.playerSequence = [];
        this.canClick = false;

        this.generateSequence();
        
        document.getElementById('memoryProgress').textContent = 
            `Round ${this.currentRound} / ${this.config.rounds}`;
        document.getElementById('memoryInstruction').textContent = 'Watch the sequence...';

        this.showSequence();
    }

    generateSequence() {
        const gridSize = this.config.gridSize;
        const totalCells = gridSize * gridSize;
        const sequenceLength = this.config.sequenceLength + Math.floor(this.currentRound / 2);
        
        this.sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            this.sequence.push(Math.floor(Math.random() * totalCells));
        }
    }

    async showSequence() {
        this.isShowingSequence = true;
        const cells = document.querySelectorAll('.memory-cell');
        const displayTime = this.config.displayTime;

        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(300);
            const cell = cells[this.sequence[i]];
            cell.classList.add('active');
            await this.delay(displayTime);
            cell.classList.remove('active');
        }

        this.isShowingSequence = false;
        this.canClick = true;
        document.getElementById('memoryInstruction').textContent = 
            `Your turn! Repeat the sequence (${this.sequence.length} cells)`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cellClick(index) {
        if (!this.canClick || this.isShowingSequence) return;

        const cells = document.querySelectorAll('.memory-cell');
        const cell = cells[index];
        
        this.playerSequence.push(index);
        const currentIndex = this.playerSequence.length - 1;

        if (this.sequence[currentIndex] === index) {
            cell.classList.add('correct');
            setTimeout(() => cell.classList.remove('correct'), 300);

            if (this.playerSequence.length === this.sequence.length) {
                this.canClick = false;
                this.correctAnswers++;
                const roundScore = this.sequence.length * 50 * this.config.difficulty;
                this.score += roundScore;
                
                document.getElementById('gameScore').textContent = `Score: ${this.score}`;
                document.getElementById('memoryInstruction').innerHTML = 
                    `<span style="color: #00E676;">✓ Perfect! +${roundScore}</span>`;
                
                setTimeout(() => this.nextRound(), 1500);
            }
        } else {
            this.canClick = false;
            cell.classList.add('wrong');
            cells[this.sequence[currentIndex]].classList.add('correct');
            
            document.getElementById('memoryInstruction').innerHTML = 
                `<span style="color: #FF5252;">✗ Wrong! The sequence was different.</span>`;
            
            setTimeout(() => {
                cells.forEach(c => {
                    c.classList.remove('wrong');
                    c.classList.remove('correct');
                });
                this.nextRound();
            }, 1500);
        }
    }

    async endGame() {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.rounds) * 100);

        try {
            const result = await GamesAPI.submitScore({
                gameType: 'memoryBoost',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.config.rounds,
                timeTaken: totalTime
            });
            this.showResults(totalTime, accuracy, result);
        } catch (error) {
            console.error('Failed to save score:', error);
            this.showResults(totalTime, accuracy, null);
        }
    }

    showResults(totalTime, accuracy, result) {
        const gameArea = document.getElementById('gameArea');
        
        let difficultyMessage = `<div class="difficulty-change same">📊 Level: ${this.config.difficulty}</div>`;
        if (result && result.difficultyChanged) {
            if (result.newDifficulty > result.previousDifficulty) {
                difficultyMessage = `<div class="difficulty-change up">🎉 Level Up! ${result.previousDifficulty} → ${result.newDifficulty}</div>`;
            } else {
                difficultyMessage = `<div class="difficulty-change down">📉 Level: ${result.previousDifficulty} → ${result.newDifficulty}</div>`;
            }
        }

        gameArea.innerHTML = `
            <div class="game-results">
                <h2>🧠 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                    <div class="result-item"><div class="result-value">${totalTime}s</div><div class="result-label">Time</div></div>
                </div>
                ${difficultyMessage}
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('memoryBoost')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let memoryGame = new MemoryBoostGame();
