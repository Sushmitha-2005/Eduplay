// Quick Quiz Game - Fixed with fallback defaults
class QuickQuizGame {
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
            this.config = await GamesAPI.getConfig('quickQuiz');
        } catch (error) {
            console.log('Using default config for Quick Quiz');
            this.config = { difficulty: 1, questionsCount: 10, timeLimit: 60 };
        }
        this.config.questionsCount = this.config.questionsCount || 10;
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
        document.getElementById('gameArea').innerHTML = `
            <div class="quiz-game-container">
                <div class="quiz-question" id="quizQuestion">Get Ready!</div>
                <div class="quiz-options" id="quizOptions"></div>
                <div class="progress-info" id="quizProgress">Question 0 / ${this.config.questionsCount}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '⚡ Quick Quiz';
    }

    nextQuestion() {
        if (this.currentQuestion >= this.config.questionsCount) {
            this.endGame();
            return;
        }
        this.currentQuestion++;
        const q = this.generateQuestion();
        this.currentAnswer = q.answer;
        
        document.getElementById('quizQuestion').textContent = q.question;
        document.getElementById('quizOptions').innerHTML = this.shuffleArray([...q.options]).map(opt => 
            `<button class="quiz-option" onclick="quizGame.checkAnswer('${opt}')">${opt}</button>`
        ).join('');
        document.getElementById('quizProgress').textContent = `Question ${this.currentQuestion} / ${this.config.questionsCount}`;
        this.startTimer();
    }

    generateQuestion() {
        const questions = [
            { question: 'What is the capital of France?', answer: 'Paris', options: ['Paris', 'London', 'Berlin', 'Madrid'] },
            { question: 'How many continents are there?', answer: '7', options: ['7', '5', '6', '8'] },
            { question: 'What planet is known as the Red Planet?', answer: 'Mars', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'] },
            { question: 'What is H2O commonly known as?', answer: 'Water', options: ['Water', 'Salt', 'Oxygen', 'Hydrogen'] },
            { question: 'How many legs does a spider have?', answer: '8', options: ['8', '6', '10', '4'] },
            { question: 'What is the largest ocean?', answer: 'Pacific', options: ['Pacific', 'Atlantic', 'Indian', 'Arctic'] },
            { question: 'What color is the sun?', answer: 'Yellow', options: ['Yellow', 'Orange', 'Red', 'White'] },
            { question: 'How many days in a week?', answer: '7', options: ['7', '5', '6', '8'] },
            { question: 'What is 10 × 5?', answer: '50', options: ['50', '45', '55', '60'] },
            { question: 'Which animal is known as mans best friend?', answer: 'Dog', options: ['Dog', 'Cat', 'Horse', 'Bird'] },
        ];
        return questions[Math.floor(Math.random() * questions.length)];
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
            this.score += 100 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        }
        setTimeout(() => this.nextQuestion(), 1200);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.questionsCount) * 100);
        try { await GamesAPI.submitScore({ gameType: 'quickQuiz', score: this.score, correctAnswers: this.correctAnswers, totalQuestions: this.config.questionsCount, timeTaken: totalTime }); } catch (e) {}
        document.getElementById('gameArea').innerHTML = `
            <div class="game-results">
                <h2>⚡ Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('quickQuiz')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let quizGame = new QuickQuizGame();
