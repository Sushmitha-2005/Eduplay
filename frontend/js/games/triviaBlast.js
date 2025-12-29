// Trivia Blast - Rapid-fire quiz game
class TriviaBlastGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.streak = 0;
        this.currentRound = 0;
        this.totalRounds = 15;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timeLeft = 10;
        this.timerInterval = null;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('triviaBlast');
            this.startTime = Date.now();
            this.render();
            this.generateQuestion();
            this.startTimer();
        } catch (error) {
            this.config = { difficulty: 1 };
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
                    <h2>💡 Trivia Blast</h2>
                    <div class="game-info">
                        <span class="timer">⏱️ <span id="timer">${this.timeLeft}</span>s</span>
                        <span>🔥 <span id="streak">${this.streak}</span></span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Question <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div id="question" class="quiz-question"></div>
                    <div id="options" class="quiz-options"></div>
                </div>
            </div>
        `;
    }

    generateQuestion() {
        const difficulty = this.config?.difficulty || 1;
        const questions = this.getQuestions(difficulty);
        const q = questions[Math.floor(Math.random() * questions.length)];
        
        this.currentQuestion = q;
        document.getElementById('question').textContent = q.question;
        
        const options = this.shuffleArray([...q.options]);
        document.getElementById('options').innerHTML = options.map(opt => 
            `<button class="quiz-option" onclick="window.currentGame.checkAnswer('${opt}')">${opt}</button>`
        ).join('');
    }

    getQuestions(difficulty) {
        const easy = [
            { question: 'What is the capital of France?', answer: 'Paris', options: ['Paris', 'London', 'Berlin', 'Madrid'] },
            { question: 'How many continents are there?', answer: '7', options: ['7', '5', '6', '8'] },
            { question: 'What color is the sun?', answer: 'Yellow', options: ['Yellow', 'Orange', 'Red', 'White'] },
            { question: 'How many legs does a spider have?', answer: '8', options: ['8', '6', '10', '4'] },
            { question: 'What is 10 + 5?', answer: '15', options: ['15', '12', '20', '14'] },
        ];
        const medium = [
            { question: 'Who wrote Romeo and Juliet?', answer: 'Shakespeare', options: ['Shakespeare', 'Dickens', 'Austen', 'Homer'] },
            { question: 'What is the largest ocean?', answer: 'Pacific', options: ['Pacific', 'Atlantic', 'Indian', 'Arctic'] },
            { question: 'What planet is known as the Red Planet?', answer: 'Mars', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'] },
            { question: 'How many bones in the human body?', answer: '206', options: ['206', '208', '186', '300'] },
            { question: 'What is H2O commonly known as?', answer: 'Water', options: ['Water', 'Salt', 'Oxygen', 'Hydrogen'] },
        ];
        const hard = [
            { question: 'What year did WW2 end?', answer: '1945', options: ['1945', '1944', '1946', '1943'] },
            { question: 'What is the speed of light?', answer: '299,792 km/s', options: ['299,792 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'] },
            { question: 'What is the chemical symbol for Gold?', answer: 'Au', options: ['Au', 'Ag', 'Fe', 'Go'] },
            { question: 'Who painted the Mona Lisa?', answer: 'Da Vinci', options: ['Da Vinci', 'Picasso', 'Van Gogh', 'Monet'] },
            { question: 'What is the smallest country?', answer: 'Vatican City', options: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'] },
        ];
        
        if (difficulty <= 3) return easy;
        if (difficulty <= 6) return [...easy, ...medium];
        return [...medium, ...hard];
    }

    checkAnswer(answer) {
        clearInterval(this.timerInterval);
        const buttons = document.querySelectorAll('.quiz-option');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === this.currentQuestion.answer) btn.classList.add('correct');
            else if (btn.textContent === answer) btn.classList.add('wrong');
        });
        
        if (answer === this.currentQuestion.answer) {
            this.streak++;
            this.correctAnswers++;
            const bonus = Math.min(this.streak * 10, 50);
            this.score += (100 + bonus) * (this.config?.difficulty || 1);
            document.getElementById('score').textContent = this.score;
            document.getElementById('streak').textContent = this.streak;
            this.showFeedback(`Correct! +${100 + bonus} 🔥`, true);
        } else {
            this.streak = 0;
            document.getElementById('streak').textContent = this.streak;
            this.showFeedback(`Wrong! Answer: ${this.currentQuestion.answer}`, false);
        }
        
        setTimeout(() => this.nextRound(), 1200);
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    startTimer() {
        this.timeLeft = 10;
        document.getElementById('timer').textContent = this.timeLeft;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                this.streak = 0;
                this.showFeedback('Time up!', false);
                setTimeout(() => this.nextRound(), 1000);
            }
        }, 1000);
    }

    nextRound() {
        clearInterval(this.timerInterval);
        this.currentRound++;
        if (this.currentRound >= this.totalRounds) {
            this.endGame();
            return;
        }
        document.getElementById('round').textContent = this.currentRound + 1;
        this.generateQuestion();
        this.startTimer();
    }

    showFeedback(message, isCorrect) {
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1200);
    }

    async endGame() {
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);

        try {
            const result = await API.submitScore({
                gameType: 'triviaBlast',
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
                        <button class="btn btn-primary" onclick="window.currentGame = new TriviaBlastGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.TriviaBlastGame = TriviaBlastGame;
