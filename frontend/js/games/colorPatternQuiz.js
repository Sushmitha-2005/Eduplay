// Color Pattern Quiz - Predict color patterns
class ColorPatternQuizGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 10;
        this.correctAnswers = 0;
        this.startTime = null;
        this.currentAnswer = null;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('colorPatternQuiz');
            this.startTime = Date.now();
            this.render();
            this.generatePattern();
        } catch (error) {
            this.config = { difficulty: 1 };
            this.startTime = Date.now();
            this.render();
            this.generatePattern();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🎨 Color Pattern Quiz</h2>
                    <div class="game-info">
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Round <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">What color comes next?</div>
                    <div id="pattern-display" class="color-pattern-display"></div>
                    <div id="color-options" class="color-options"></div>
                </div>
            </div>
        `;
    }

    generatePattern() {
        const colors = [
            { name: 'Red', hex: '#e74c3c' },
            { name: 'Blue', hex: '#3498db' },
            { name: 'Green', hex: '#2ecc71' },
            { name: 'Yellow', hex: '#f1c40f' },
            { name: 'Purple', hex: '#9b59b6' },
            { name: 'Orange', hex: '#e67e22' },
            { name: 'Pink', hex: '#e91e63' },
            { name: 'Cyan', hex: '#00bcd4' }
        ];
        
        const difficulty = this.config?.difficulty || 1;
        const patternLength = Math.min(3 + Math.floor(difficulty / 2), 6);
        const usedColors = colors.slice(0, Math.min(3 + difficulty, 8));
        
        // Generate pattern types based on difficulty
        let pattern = [];
        let answer;
        
        if (difficulty <= 3) {
            // Simple AB pattern
            const colorA = usedColors[Math.floor(Math.random() * usedColors.length)];
            const colorB = usedColors.filter(c => c !== colorA)[Math.floor(Math.random() * (usedColors.length - 1))];
            for (let i = 0; i < patternLength; i++) {
                pattern.push(i % 2 === 0 ? colorA : colorB);
            }
            answer = patternLength % 2 === 0 ? colorA : colorB;
        } else if (difficulty <= 6) {
            // ABC pattern
            const shuffled = this.shuffleArray([...usedColors]).slice(0, 3);
            for (let i = 0; i < patternLength; i++) {
                pattern.push(shuffled[i % 3]);
            }
            answer = shuffled[patternLength % 3];
        } else {
            // ABBA or complex pattern
            const shuffled = this.shuffleArray([...usedColors]).slice(0, 4);
            const template = [0, 1, 1, 0];
            for (let i = 0; i < patternLength; i++) {
                pattern.push(shuffled[template[i % 4]]);
            }
            answer = shuffled[template[patternLength % 4]];
        }
        
        this.currentAnswer = answer;
        
        // Display pattern
        document.getElementById('pattern-display').innerHTML = 
            pattern.map(c => `<div class="pattern-color" style="background:${c.hex}"></div>`).join('') +
            '<div class="pattern-color mystery">?</div>';
        
        // Display options
        const options = this.shuffleArray([answer, ...usedColors.filter(c => c !== answer).slice(0, 3)]);
        document.getElementById('color-options').innerHTML = options.map(c => 
            `<div class="color-option" style="background:${c.hex}" onclick="window.currentGame.checkAnswer('${c.name}')" data-color="${c.name}"></div>`
        ).join('');
    }

    checkAnswer(colorName) {
        const options = document.querySelectorAll('.color-option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (opt.dataset.color === this.currentAnswer.name) opt.classList.add('correct');
            else if (opt.dataset.color === colorName) opt.classList.add('wrong');
        });
        
        if (colorName === this.currentAnswer.name) {
            this.correctAnswers++;
            this.score += 100 * (this.config?.difficulty || 1);
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Correct! 🎉', true);
        } else {
            this.showFeedback(`Wrong! It was ${this.currentAnswer.name}`, false);
        }
        
        setTimeout(() => this.nextRound(), 1500);
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound >= this.totalRounds) {
            this.endGame();
            return;
        }
        document.getElementById('round').textContent = this.currentRound + 1;
        this.generatePattern();
    }

    showFeedback(message, isCorrect) {
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1500);
    }

    async endGame() {
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);

        try {
            const result = await API.submitScore({
                gameType: 'colorPatternQuiz',
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
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new ColorPatternQuizGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.ColorPatternQuizGame = ColorPatternQuizGame;
