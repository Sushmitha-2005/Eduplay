// Math Ladder - Solve math to climb levels
class MathLadderGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.level = 1;
        this.maxLevel = 10;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.currentAnswer = 0;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('mathLadder');
            this.timeLeft = this.config.timeLimit || 15;
            this.startTime = Date.now();
            this.render();
            this.generateQuestion();
            this.startTimer();
        } catch (error) {
            this.config = { difficulty: 1, timeLimit: 15 };
            this.startTime = Date.now();
            this.render();
            this.generateQuestion();
            this.startTimer();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>📈 Math Ladder</h2>
                    <div class="game-info">
                        <span class="timer">⏱️ <span id="timer">${this.timeLeft}</span>s</span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="ladder-visual">
                        ${this.renderLadder()}
                    </div>
                    <div class="math-problem" id="problem"></div>
                    <div class="math-input-area">
                        <input type="number" id="answer-input" placeholder="?" autofocus>
                        <button class="btn btn-primary" onclick="window.currentGame.submitAnswer()">Submit</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
    }

    renderLadder() {
        let html = '<div class="ladder">';
        for (let i = this.maxLevel; i >= 1; i--) {
            const isCurrent = i === this.level;
            const isCompleted = i < this.level;
            html += `<div class="ladder-step ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
                ${i === this.level ? '🧗' : (isCompleted ? '✓' : i)}
            </div>`;
        }
        html += '</div>';
        return html;
    }

    generateQuestion() {
        const difficulty = (this.config?.difficulty || 1) + Math.floor(this.level / 2);
        const ops = ['+', '-', '*'];
        const maxNum = 10 + this.level * 5;
        let n1, n2, op, answer;

        if (difficulty < 3) {
            op = ops[Math.floor(Math.random() * 2)];
        } else {
            op = ops[Math.floor(Math.random() * 3)];
        }

        switch (op) {
            case '+':
                n1 = Math.floor(Math.random() * maxNum) + 1;
                n2 = Math.floor(Math.random() * maxNum) + 1;
                answer = n1 + n2;
                break;
            case '-':
                n1 = Math.floor(Math.random() * maxNum) + 10;
                n2 = Math.floor(Math.random() * n1);
                answer = n1 - n2;
                break;
            case '*':
                n1 = Math.floor(Math.random() * 12) + 1;
                n2 = Math.floor(Math.random() * 12) + 1;
                answer = n1 * n2;
                break;
        }

        this.currentAnswer = answer;
        document.getElementById('problem').textContent = `${n1} ${op} ${n2} = ?`;
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').focus();
    }

    submitAnswer() {
        const userAnswer = parseInt(document.getElementById('answer-input').value);
        if (userAnswer === this.currentAnswer) {
            this.correctAnswers++;
            this.score += this.level * 50;
            this.level++;
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Correct! Climbing up! 🎉', true);

            if (this.level > this.maxLevel) {
                this.endGame(true);
                return;
            }
            this.resetTimer();
            this.render();
            this.generateQuestion();
            this.startTimer();
        } else {
            this.level = Math.max(1, this.level - 1);
            this.showFeedback(`Wrong! The answer was ${this.currentAnswer}`, false);
            this.resetTimer();
            this.render();
            this.generateQuestion();
            this.startTimer();
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                this.level = Math.max(1, this.level - 1);
                this.showFeedback('Time up! Slipping down...', false);
                this.resetTimer();
                this.render();
                this.generateQuestion();
                this.startTimer();
            }
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = this.config?.timeLimit || 15;
    }

    showFeedback(message, isCorrect) {
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1500);
    }

    async endGame(won) {
        clearInterval(this.timerInterval);
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);

        try {
            const result = await API.submitScore({
                gameType: 'mathLadder',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.maxLevel,
                timeTaken
            });
            this.showResults(result, won);
        } catch (error) {
            this.showResults(null, won);
        }
    }

    showResults(result, won) {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-results">
                    <h2>${won ? '🏆 You Reached the Top!' : '🎯 Game Complete!'}</h2>
                    <div class="results-stats">
                        <div class="result-item"><span class="result-value">${this.score}</span><span class="result-label">Score</span></div>
                        <div class="result-item"><span class="result-value">${this.level - 1}/${this.maxLevel}</span><span class="result-label">Level</span></div>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new MathLadderGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.MathLadderGame = MathLadderGame;
