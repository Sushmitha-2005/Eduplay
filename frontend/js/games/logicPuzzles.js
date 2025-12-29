// Logic Puzzles Game - Fixed with fallback defaults
class LogicPuzzlesGame {
    constructor() {
        this.config = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.currentAnswer = null;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('logicPuzzles');
        } catch (error) {
            console.log('Using default config for Logic Puzzles');
            this.config = { difficulty: 1, questionsCount: 8, timeLimit: 60 };
        }
        this.config.questionsCount = this.config.questionsCount || 8;
        this.config.timeLimit = this.config.timeLimit || 60;
        this.config.difficulty = this.config.difficulty || 1;
        
        this.resetGame();
        this.renderGame();
        this.nextQuestion();
    }

    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    renderGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="logic-game-container">
                <div class="logic-puzzle" id="logicPuzzle">Get Ready!</div>
                <div class="logic-options" id="logicOptions"></div>
                <div class="progress-info" id="logicProgress">Question 0 / ${this.config.questionsCount}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🧩 Logic Puzzles';
    }

    nextQuestion() {
        if (this.currentQuestion >= this.config.questionsCount) {
            this.endGame();
            return;
        }
        this.currentQuestion++;
        const puzzle = this.generatePuzzle();
        this.currentAnswer = puzzle.answer;
        
        document.getElementById('logicPuzzle').innerHTML = `<div class="quiz-question">${puzzle.question}</div>`;
        document.getElementById('logicOptions').innerHTML = puzzle.options.map(opt => 
            `<button class="quiz-option" onclick="logicGame.checkAnswer('${opt}')">${opt}</button>`
        ).join('');
        document.getElementById('logicProgress').textContent = `Question ${this.currentQuestion} / ${this.config.questionsCount}`;
        this.startTimer();
    }

    generatePuzzle() {
        const puzzles = [
            { question: 'What comes next: 2, 4, 6, 8, ?', answer: '10', options: ['10', '9', '12', '11'] },
            { question: 'What comes next: 1, 3, 5, 7, ?', answer: '9', options: ['9', '8', '10', '11'] },
            { question: 'What comes next: 3, 6, 9, 12, ?', answer: '15', options: ['15', '14', '16', '13'] },
            { question: 'If A=1, B=2, C=3, what is D?', answer: '4', options: ['4', '5', '3', '6'] },
            { question: 'What comes next: 1, 4, 9, 16, ?', answer: '25', options: ['25', '20', '24', '36'] },
            { question: 'What comes next: 2, 6, 12, 20, ?', answer: '30', options: ['30', '28', '32', '26'] },
            { question: 'What comes next: 1, 1, 2, 3, 5, ?', answer: '8', options: ['8', '7', '6', '9'] },
            { question: 'Complete: Monday, Tuesday, Wednesday, ?', answer: 'Thursday', options: ['Thursday', 'Friday', 'Saturday', 'Sunday'] },
        ];
        const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        puzzle.options = this.shuffleArray([...puzzle.options]);
        return puzzle;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
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

    checkAnswer(answer) {
        clearInterval(this.timerInterval);
        const buttons = document.querySelectorAll('.quiz-option');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === this.currentAnswer) btn.classList.add('correct');
            else if (btn.textContent === answer) btn.classList.add('wrong');
        });
        
        if (answer === this.currentAnswer) {
            this.correctAnswers++;
            this.score += 150 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        }
        setTimeout(() => this.nextQuestion(), 1500);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.questionsCount) * 100);
        
        try {
            const result = await GamesAPI.submitScore({
                gameType: 'logicPuzzles',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.config.questionsCount,
                timeTaken: totalTime
            });
            this.showResults(totalTime, accuracy, result);
        } catch (error) {
            this.showResults(totalTime, accuracy, null);
        }
    }

    showResults(totalTime, accuracy, result) {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="game-results">
                <h2>🧩 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                    <div class="result-item"><div class="result-value">${totalTime}s</div><div class="result-label">Time</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('logicPuzzles')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let logicGame = new LogicPuzzlesGame();
