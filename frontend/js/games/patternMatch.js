// Pattern Match Game - Fixed with fallback defaults
class PatternMatchGame {
    constructor() {
        this.config = null;
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.currentAnswer = null;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('patternMatch');
        } catch (error) {
            console.log('Using default config for Pattern Match');
            this.config = { difficulty: 1, rounds: 8 };
        }
        this.config.rounds = this.config.rounds || 8;
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
    }

    renderGame() {
        document.getElementById('gameArea').innerHTML = `
            <div class="pattern-game-container">
                <div class="word-instruction">Complete the pattern!</div>
                <div class="sequence-display" id="patternDisplay"></div>
                <div class="quiz-options" id="patternOptions"></div>
                <div class="progress-info" id="patternProgress">Round 0 / ${this.config.rounds}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🎨 Pattern Match';
    }

    nextRound() {
        if (this.currentRound >= this.config.rounds) {
            this.endGame();
            return;
        }
        this.currentRound++;
        const pattern = this.generatePattern();
        this.currentAnswer = pattern.answer;
        
        document.getElementById('patternDisplay').innerHTML = 
            pattern.sequence.map(s => `<span class="seq-item">${s}</span>`).join('') +
            '<span class="seq-item mystery">?</span>';
        document.getElementById('patternOptions').innerHTML = this.shuffleArray([...pattern.options]).map(opt => 
            `<button class="quiz-option" onclick="patternGame.checkAnswer('${opt}')">${opt}</button>`
        ).join('');
        document.getElementById('patternProgress').textContent = `Round ${this.currentRound} / ${this.config.rounds}`;
    }

    generatePattern() {
        const patterns = [
            { sequence: ['A', 'B', 'C', 'D'], answer: 'E', options: ['E', 'F', 'G', 'A'] },
            { sequence: ['2', '4', '6', '8'], answer: '10', options: ['10', '9', '12', '11'] },
            { sequence: ['🔴', '🟡', '🔴', '🟡'], answer: '🔴', options: ['🔴', '🟡', '🟢', '🔵'] },
            { sequence: ['1', '2', '4', '8'], answer: '16', options: ['16', '10', '12', '32'] },
            { sequence: ['△', '□', '△', '□'], answer: '△', options: ['△', '□', '○', '◇'] },
            { sequence: ['J', 'F', 'M', 'A'], answer: 'M', options: ['M', 'J', 'S', 'A'] },
            { sequence: ['🌑', '🌒', '🌓', '🌔'], answer: '🌕', options: ['🌕', '🌖', '🌗', '🌘'] },
            { sequence: ['1', '3', '5', '7'], answer: '9', options: ['9', '8', '10', '11'] },
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    checkAnswer(answer) {
        const buttons = document.querySelectorAll('.quiz-option');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === this.currentAnswer) btn.classList.add('correct');
            else if (btn.textContent === answer) btn.classList.add('wrong');
        });
        if (answer === this.currentAnswer) {
            this.correctAnswers++;
            this.score += 100 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        }
        setTimeout(() => this.nextRound(), 1500);
    }

    async endGame() {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.rounds) * 100);
        try { await GamesAPI.submitScore({ gameType: 'patternMatch', score: this.score, correctAnswers: this.correctAnswers, totalQuestions: this.config.rounds, timeTaken: totalTime }); } catch (e) {}
        document.getElementById('gameArea').innerHTML = `
            <div class="game-results">
                <h2>🎨 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('patternMatch')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let patternGame = new PatternMatchGame();
