// Logic Grid - Fill grids logically based on row/column rules
class LogicGridGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 6;
        this.correctAnswers = 0;
        this.startTime = null;
        this.grid = [];
        this.solution = [];
        this.rowClues = [];
        this.colClues = [];
        this.gridSize = 4;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('logicGrid');
            this.gridSize = Math.min(3 + Math.floor((this.config.difficulty || 1) / 3), 5);
            this.startTime = Date.now();
            this.render();
            this.generatePuzzle();
        } catch (error) {
            this.config = { difficulty: 1 };
            this.gridSize = 3;
            this.startTime = Date.now();
            this.render();
            this.generatePuzzle();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🗂️ Logic Grid</h2>
                    <div class="game-info">
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Puzzle <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">Fill cells so each row & column sums to the clue!</div>
                    <div id="logic-grid-container" class="logic-grid-container"></div>
                    <div class="puzzle-actions">
                        <button class="btn btn-secondary" onclick="window.currentGame.clearGrid()">Clear</button>
                        <button class="btn btn-success" onclick="window.currentGame.checkSolution()">Check</button>
                    </div>
                </div>
            </div>
        `;
    }

    generatePuzzle() {
        const size = this.gridSize;
        const maxNum = Math.min(3 + (this.config?.difficulty || 1), 9);
        
        // Generate solution with random numbers
        this.solution = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(Math.floor(Math.random() * maxNum) + 1);
            }
            this.solution.push(row);
        }
        
        // Calculate row and column sums
        this.rowClues = this.solution.map(row => row.reduce((a, b) => a + b, 0));
        this.colClues = [];
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let i = 0; i < size; i++) {
                sum += this.solution[i][j];
            }
            this.colClues.push(sum);
        }
        
        // Initialize empty grid
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        
        // Pre-fill some cells based on difficulty
        const difficulty = this.config?.difficulty || 1;
        const prefillCount = Math.max(1, Math.floor(size * size / 3) - Math.floor(difficulty / 2));
        const positions = [];
        for (let i = 0; i < size * size; i++) positions.push(i);
        this.shuffleArray(positions);
        
        for (let i = 0; i < prefillCount; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / size);
            const col = pos % size;
            this.grid[row][col] = this.solution[row][col];
        }
        
        this.renderGrid();
    }

    renderGrid() {
        const size = this.gridSize;
        const container = document.getElementById('logic-grid-container');
        
        let html = '<table class="logic-table">';
        
        // Header row with column clues
        html += '<tr><td class="clue-cell corner"></td>';
        for (let j = 0; j < size; j++) {
            html += `<td class="clue-cell col-clue">${this.colClues[j]}</td>`;
        }
        html += '</tr>';
        
        // Grid rows with row clues
        for (let i = 0; i < size; i++) {
            html += `<tr><td class="clue-cell row-clue">${this.rowClues[i]}</td>`;
            for (let j = 0; j < size; j++) {
                const val = this.grid[i][j];
                const isPreFilled = val !== 0 && val === this.solution[i][j] && this.wasPreFilled(i, j);
                html += `<td class="grid-cell ${isPreFilled ? 'prefilled' : 'editable'}" data-row="${i}" data-col="${j}" 
                         ${!isPreFilled ? `onclick="window.currentGame.cycleCell(${i}, ${j})"` : ''}>
                         ${val || ''}
                         </td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        container.innerHTML = html;
    }

    wasPreFilled(row, col) {
        // Check if this cell was prefilled (value matches solution on first render)
        return this.grid[row][col] === this.solution[row][col];
    }

    cycleCell(row, col) {
        const maxNum = Math.min(3 + (this.config?.difficulty || 1), 9);
        this.grid[row][col] = (this.grid[row][col] % maxNum) + 1;
        this.renderGrid();
    }

    clearGrid() {
        const size = this.gridSize;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // Only clear non-prefilled cells
                if (this.grid[i][j] !== this.solution[i][j]) {
                    this.grid[i][j] = 0;
                }
            }
        }
        this.renderGrid();
    }

    checkSolution() {
        const size = this.gridSize;
        let correct = true;
        
        // Check all cells are filled
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.grid[i][j] === 0) {
                    this.showFeedback('Fill all cells first!', false);
                    return;
                }
            }
        }
        
        // Check row sums
        for (let i = 0; i < size; i++) {
            const rowSum = this.grid[i].reduce((a, b) => a + b, 0);
            if (rowSum !== this.rowClues[i]) {
                correct = false;
                break;
            }
        }
        
        // Check column sums
        if (correct) {
            for (let j = 0; j < size; j++) {
                let colSum = 0;
                for (let i = 0; i < size; i++) {
                    colSum += this.grid[i][j];
                }
                if (colSum !== this.colClues[j]) {
                    correct = false;
                    break;
                }
            }
        }
        
        if (correct) {
            this.correctAnswers++;
            this.score += 300 * (this.config?.difficulty || 1);
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Perfect! 🎉', true);
            setTimeout(() => this.nextRound(), 1500);
        } else {
            this.showFeedback('Sums don\'t match the clues!', false);
        }
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound >= this.totalRounds) {
            this.endGame();
            return;
        }
        document.getElementById('round').textContent = this.currentRound + 1;
        this.generatePuzzle();
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
                gameType: 'logicGrid',
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
                        <button class="btn btn-primary" onclick="window.currentGame = new LogicGridGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.LogicGridGame = LogicGridGame;
