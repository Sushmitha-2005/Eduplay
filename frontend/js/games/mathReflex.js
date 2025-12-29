// Math Reflex Game - Fixed version
class MathReflexGame {
    constructor() {
        this.config = null;
        this.currentQuestion = 0;
        this.questionsCount = 10;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.questionStartTime = null;
        this.timerInterval = null;
        this.currentAnswer = null;
        this.difficulty = 1;
        this.timeLimit = 60;
        this.maxNumber = 20;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('mathReflex');
            this.difficulty = this.config.difficulty || 1;
            this.questionsCount = this.config.questionsCount || 10;
            this.timeLimit = this.config.timeLimit || 60;
            this.maxNumber = this.config.maxNumber || 20;
        } catch (error) {
            // Use default config if API fails
            console.log('Using default config for Math Reflex');
            this.difficulty = 1;
            this.questionsCount = 10;
            this.timeLimit = 60;
            this.maxNumber = 20;
        }
        
        this.resetGame();
        this.renderGame();
        this.nextQuestion();
    }

    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    renderGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="math-game-container">
                <div class="math-problem" id="mathProblem">Get Ready!</div>
                <input type="number" class="math-input" id="mathAnswer" placeholder="?" autofocus>
                <button class="btn btn-primary" onclick="mathGame.checkAnswer()">Submit</button>
                <div class="progress-info" id="mathProgress">
                    Question 0 / ${this.questionsCount}
                </div>
            </div>
        `;
        
        document.getElementById('gameDifficulty').textContent = `Level: ${this.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🔢 Math Reflex';
        
        // Add enter key listener
        document.getElementById('mathAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                mathGame.checkAnswer();
            }
        });
    }

    nextQuestion() {
        if (this.currentQuestion >= this.questionsCount) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.questionStartTime = Date.now();
        
        // Generate NEW question with random numbers
        const problem = this.generateProblem();
        this.currentAnswer = problem.answer;

        // Update DOM with new problem
        const problemEl = document.getElementById('mathProblem');
        problemEl.textContent = `${problem.num1} ${problem.operator} ${problem.num2} = ?`;
        problemEl.style.color = ''; // Reset color
        
        const answerInput = document.getElementById('mathAnswer');
        answerInput.value = '';
        answerInput.focus();
        
        document.getElementById('mathProgress').textContent = 
            `Question ${this.currentQuestion} / ${this.questionsCount}`;

        // Start question timer
        this.startQuestionTimer();
    }

    generateProblem() {
        const operators = ['+', '-'];
        if (this.difficulty >= 3) operators.push('*');
        if (this.difficulty >= 5) operators.push('/');
        
        const operator = operators[Math.floor(Math.random() * operators.length)];
        const maxNum = this.maxNumber + (this.difficulty * 5);
        
        let num1, num2, answer;

        switch(operator) {
            case '+':
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * maxNum) + 10;
                num2 = Math.floor(Math.random() * Math.min(num1, maxNum)) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
            case '/':
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = Math.floor(Math.random() * 10) + 1;
                num1 = num2 * answer;
                break;
        }

        console.log(`Generated: ${num1} ${operator} ${num2} = ${answer}`);
        return { num1, num2, operator, answer };
    }

    startQuestionTimer() {
        let timeLeft = this.timeLimit;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.updateTimer(timeLeft);
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.updateTimer(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('gameTimer').textContent = 
            `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    handleTimeout() {
        const problemEl = document.getElementById('mathProblem');
        problemEl.innerHTML = `<span style="color: #FF5252;">Time's up! Answer was ${this.currentAnswer}</span>`;
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }

    checkAnswer() {
        clearInterval(this.timerInterval);
        
        const answerInput = document.getElementById('mathAnswer');
        const userAnswer = parseInt(answerInput.value);
        const problemEl = document.getElementById('mathProblem');
        const responseTime = (Date.now() - this.questionStartTime) / 1000;

        if (isNaN(userAnswer)) {
            problemEl.innerHTML = `<span style="color: #FF5252;">Please enter a number!</span>`;
            this.startQuestionTimer();
            return;
        }

        if (userAnswer === this.currentAnswer) {
            this.correctAnswers++;
            // Score based on speed and difficulty
            const timeBonus = Math.max(0, (this.timeLimit - responseTime) * 10);
            const questionScore = Math.round(100 + timeBonus * this.difficulty);
            this.score += questionScore;
            
            problemEl.innerHTML = `<span style="color: #00E676;">✓ Correct! +${questionScore}</span>`;
        } else {
            problemEl.innerHTML = `<span style="color: #FF5252;">✗ Wrong! Answer was ${this.currentAnswer}</span>`;
        }

        document.getElementById('gameScore').textContent = `Score: ${this.score}`;

        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.questionsCount) * 100);

        try {
            const result = await GamesAPI.submitScore({
                gameType: 'mathReflex',
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.questionsCount,
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
        
        let difficultyMessage = '';
        if (result && result.difficultyChanged) {
            if (result.newDifficulty > result.previousDifficulty) {
                difficultyMessage = `<div class="difficulty-change up">
                    🎉 Level Up! ${result.previousDifficulty} → ${result.newDifficulty}
                </div>`;
            } else {
                difficultyMessage = `<div class="difficulty-change down">
                    📉 Level adjusted: ${result.previousDifficulty} → ${result.newDifficulty}
                </div>`;
            }
        } else {
            difficultyMessage = `<div class="difficulty-change same">
                📊 Level maintained at ${this.difficulty}
            </div>`;
        }

        gameArea.innerHTML = `
            <div class="game-results">
                <h2>🎯 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item">
                        <div class="result-value">${this.score}</div>
                        <div class="result-label">Total Score</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${accuracy}%</div>
                        <div class="result-label">Accuracy</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${totalTime}s</div>
                        <div class="result-label">Time Taken</div>
                    </div>
                </div>
                ${difficultyMessage}
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('mathReflex')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;

        if (typeof updateSkillLevelDisplay === 'function') {
            updateSkillLevelDisplay();
        }
    }
}

// Global variable
let mathGame = new MathReflexGame();
