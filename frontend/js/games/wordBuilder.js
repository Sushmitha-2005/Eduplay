// Word Builder Game - Fixed with fallback defaults
class WordBuilderGame {
    constructor() {
        this.config = null;
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.currentWord = '';
        this.scrambled = '';
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('wordBuilder');
        } catch (error) {
            console.log('Using default config for Word Builder');
            this.config = { difficulty: 1, rounds: 8, timeLimit: 60 };
        }
        this.config.rounds = this.config.rounds || 8;
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
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="word-game-container">
                <div class="word-instruction">Unscramble the word!</div>
                <div class="word-display" id="scrambledWord"></div>
                <input type="text" class="math-input" id="wordAnswer" placeholder="Your answer" autofocus>
                <button class="btn btn-primary" onclick="wordGame.checkAnswer()">Submit</button>
                <div class="progress-info" id="wordProgress">Round 0 / ${this.config.rounds}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '📝 Word Builder';
        document.getElementById('wordAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') wordGame.checkAnswer();
        });
    }

    nextRound() {
        if (this.currentRound >= this.config.rounds) {
            this.endGame();
            return;
        }
        this.currentRound++;
        this.generateWord();
        document.getElementById('scrambledWord').textContent = this.scrambled;
        document.getElementById('wordAnswer').value = '';
        document.getElementById('wordAnswer').focus();
        document.getElementById('wordProgress').textContent = `Round ${this.currentRound} / ${this.config.rounds}`;
        this.startTimer();
    }

    generateWord() {
        const words = [
            'CAT', 'DOG', 'SUN', 'RUN', 'FUN', 'HAT', 'BAT', 'RAT',
            'APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EARTH', 'FRESH', 'GRAPE',
            'PLANET', 'SCHOOL', 'FRIEND', 'GARDEN', 'BRIDGE', 'CASTLE',
            'STUDENT', 'WEATHER', 'PROBLEM', 'KITCHEN', 'BLANKET'
        ];
        const difficulty = this.config.difficulty || 1;
        const startIdx = Math.min(difficulty * 3, words.length - 8);
        const pool = words.slice(startIdx, startIdx + 10);
        this.currentWord = pool[Math.floor(Math.random() * pool.length)];
        this.scrambled = this.scrambleWord(this.currentWord);
    }

    scrambleWord(word) {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const scrambled = arr.join('');
        return scrambled === word ? this.scrambleWord(word) : scrambled;
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
                this.showResult(false);
            }
        }, 1000);
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('gameTimer').textContent = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    checkAnswer() {
        clearInterval(this.timerInterval);
        const answer = document.getElementById('wordAnswer').value.toUpperCase().trim();
        if (answer === this.currentWord) {
            this.correctAnswers++;
            this.score += this.currentWord.length * 20 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
            this.showResult(true);
        } else {
            this.showResult(false);
        }
    }

    showResult(correct) {
        const display = document.getElementById('scrambledWord');
        display.innerHTML = correct 
            ? `<span style="color: #00E676;">✓ Correct!</span>`
            : `<span style="color: #FF5252;">✗ Answer: ${this.currentWord}</span>`;
        setTimeout(() => this.nextRound(), 1500);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.rounds) * 100);
        try {
            await GamesAPI.submitScore({
                gameType: 'wordBuilder',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.config.rounds,
                timeTaken: totalTime
            });
        } catch (error) {}
        this.showResults(totalTime, accuracy);
    }

    showResults(totalTime, accuracy) {
        document.getElementById('gameArea').innerHTML = `
            <div class="game-results">
                <h2>📝 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                    <div class="result-item"><div class="result-value">${totalTime}s</div><div class="result-label">Time</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('wordBuilder')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let wordGame = new WordBuilderGame();
