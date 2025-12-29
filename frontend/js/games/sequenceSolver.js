// Sequence Solver - Complete numeric or letter sequences
class SequenceSolverGame {
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
            this.config = await API.getGameConfig('sequenceSolver');
            this.startTime = Date.now();
            this.render();
            this.generateSequence();
        } catch (error) {
            this.config = { difficulty: 1 };
            this.startTime = Date.now();
            this.render();
            this.generateSequence();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🔗 Sequence Solver</h2>
                    <div class="game-info">
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Round <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">What comes next in the sequence?</div>
                    <div id="sequence-display" class="sequence-display"></div>
                    <div id="options" class="puzzle-options"></div>
                </div>
            </div>
        `;
    }

    generateSequence() {
        const difficulty = this.config?.difficulty || 1;
        const sequences = this.getSequences(difficulty);
        const seq = sequences[Math.floor(Math.random() * sequences.length)];
        
        this.currentAnswer = seq.answer;
        
        document.getElementById('sequence-display').innerHTML = 
            seq.display.map(n => `<span class="seq-item">${n}</span>`).join('') +
            '<span class="seq-item mystery">?</span>';
        
        const options = this.shuffleArray([...seq.options]);
        document.getElementById('options').innerHTML = options.map(opt => 
            `<button class="puzzle-option" onclick="window.currentGame.checkAnswer('${opt}')">${opt}</button>`
        ).join('');
    }

    getSequences(difficulty) {
        const easy = [
            { display: [2, 4, 6, 8], answer: '10', options: ['10', '9', '12', '11'] },
            { display: [1, 3, 5, 7], answer: '9', options: ['9', '8', '10', '11'] },
            { display: [5, 10, 15, 20], answer: '25', options: ['25', '30', '22', '24'] },
            { display: ['A', 'B', 'C', 'D'], answer: 'E', options: ['E', 'F', 'G', 'Z'] },
        ];
        const medium = [
            { display: [1, 4, 9, 16], answer: '25', options: ['25', '20', '36', '24'] },
            { display: [2, 6, 12, 20], answer: '30', options: ['30', '28', '32', '26'] },
            { display: [1, 1, 2, 3, 5], answer: '8', options: ['8', '7', '6', '9'] },
            { display: ['M', 'T', 'W', 'T'], answer: 'F', options: ['F', 'S', 'M', 'T'] },
        ];
        const hard = [
            { display: [1, 2, 6, 24], answer: '120', options: ['120', '48', '100', '96'] },
            { display: [2, 3, 5, 7, 11], answer: '13', options: ['13', '12', '14', '15'] },
            { display: [1, 8, 27, 64], answer: '125', options: ['125', '100', '81', '216'] },
            { display: ['J', 'F', 'M', 'A'], answer: 'M', options: ['M', 'J', 'S', 'A'] },
        ];
        
        if (difficulty <= 3) return easy;
        if (difficulty <= 6) return [...easy, ...medium];
        return [...medium, ...hard];
    }

    checkAnswer(answer) {
        const buttons = document.querySelectorAll('.puzzle-option');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === this.currentAnswer) btn.classList.add('correct');
            else if (btn.textContent === answer) btn.classList.add('wrong');
        });
        
        if (answer === this.currentAnswer) {
            this.correctAnswers++;
            this.score += 100 * (this.config?.difficulty || 1);
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Correct! 🎉', true);
        } else {
            this.showFeedback(`Wrong! Answer: ${this.currentAnswer}`, false);
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
        this.generateSequence();
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
                gameType: 'sequenceSolver',
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
                        <button class="btn btn-primary" onclick="window.currentGame = new SequenceSolverGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.SequenceSolverGame = SequenceSolverGame;
