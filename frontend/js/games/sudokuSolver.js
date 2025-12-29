// Sudoku Solver - Classic Sudoku puzzles with adaptive difficulty
class SudokuSolverGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 3;
        this.correctAnswers = 0;
        this.startTime = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.grid = [];
        this.solution = [];
        this.selectedCell = null;
        this.gridSize = 4; // 4x4 for easy, 6x6/9x9 for harder
    }

    async init() {
        try {
            this.config = await API.getGameConfig('sudokuSolver');
            this.totalRounds = this.config.roundsCount || 3;
            this.timeLeft = this.config.timeLimit || 180;
            this.gridSize = this.getGridSize(this.config.difficulty || 1);
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generatePuzzle();
        } catch (error) {
            console.error('Failed to init Sudoku:', error);
            this.config = { difficulty: 1, timeLimit: 180, roundsCount: 3 };
            this.gridSize = 4;
            this.startTime = Date.now();
            this.render();
            this.startTimer();
            this.generatePuzzle();
        }
    }

    getGridSize(difficulty) {
        if (difficulty <= 3) return 4;
        if (difficulty <= 6) return 6;
        return 9;
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🧩 Sudoku Solver</h2>
                    <div class="game-info">
                        <span class="timer">⏱️ <span id="timer">${this.formatTime(this.timeLeft)}</span></span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Puzzle <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">Fill in the missing numbers (1-${this.gridSize})</div>
                    <div id="sudoku-grid" class="sudoku-grid"></div>
                    <div class="number-pad" id="number-pad"></div>
                    <button class="btn btn-success" onclick="window.currentGame.checkSolution()">Check Solution</button>
                </div>
            </div>
        `;
    }

    generatePuzzle() {
        const n = this.gridSize;
        const boxSize = n === 4 ? 2 : (n === 6 ? 2 : 3);
        const boxWidth = n === 6 ? 3 : boxSize;
        
        // Generate a solved grid first
        this.solution = this.generateSolvedGrid(n, boxSize, boxWidth);
        
        // Create puzzle by removing numbers
        this.grid = this.solution.map(row => [...row]);
        const difficulty = this.config?.difficulty || 1;
        const cellsToRemove = Math.min(Math.floor(n * n * (0.4 + difficulty * 0.05)), n * n - n);
        
        const positions = [];
        for (let i = 0; i < n * n; i++) positions.push(i);
        this.shuffleArray(positions);
        
        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / n);
            const col = pos % n;
            this.grid[row][col] = 0;
        }
        
        this.renderGrid();
        this.renderNumberPad();
    }

    generateSolvedGrid(n, boxHeight, boxWidth) {
        const grid = Array(n).fill(null).map(() => Array(n).fill(0));
        
        // Fill diagonal boxes first (they're independent)
        for (let box = 0; box < n; box += boxHeight) {
            this.fillBox(grid, box, box, boxHeight, boxWidth, n);
        }
        
        // Solve the rest
        this.solveSudoku(grid, n, boxHeight, boxWidth);
        
        return grid;
    }

    fillBox(grid, startRow, startCol, boxHeight, boxWidth, n) {
        const nums = [];
        for (let i = 1; i <= n; i++) nums.push(i);
        this.shuffleArray(nums);
        
        let idx = 0;
        for (let i = 0; i < boxHeight && idx < nums.length; i++) {
            for (let j = 0; j < boxWidth && idx < nums.length; j++) {
                if (startRow + i < n && startCol + j < n) {
                    grid[startRow + i][startCol + j] = nums[idx++];
                }
            }
        }
    }

    solveSudoku(grid, n, boxHeight, boxWidth) {
        const empty = this.findEmpty(grid, n);
        if (!empty) return true;
        
        const [row, col] = empty;
        const nums = [];
        for (let i = 1; i <= n; i++) nums.push(i);
        this.shuffleArray(nums);
        
        for (const num of nums) {
            if (this.isValid(grid, row, col, num, n, boxHeight, boxWidth)) {
                grid[row][col] = num;
                if (this.solveSudoku(grid, n, boxHeight, boxWidth)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    findEmpty(grid, n) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (grid[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    isValid(grid, row, col, num, n, boxHeight, boxWidth) {
        // Check row
        if (grid[row].includes(num)) return false;
        
        // Check column
        for (let i = 0; i < n; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // Check box
        const boxStartRow = Math.floor(row / boxHeight) * boxHeight;
        const boxStartCol = Math.floor(col / boxWidth) * boxWidth;
        
        for (let i = 0; i < boxHeight; i++) {
            for (let j = 0; j < boxWidth; j++) {
                if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
            }
        }
        
        return true;
    }

    renderGrid() {
        const n = this.gridSize;
        const gridEl = document.getElementById('sudoku-grid');
        gridEl.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        gridEl.className = `sudoku-grid size-${n}`;
        
        let html = '';
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const value = this.grid[i][j];
                const isFixed = value !== 0;
                const cellId = `cell-${i}-${j}`;
                html += `
                    <div class="sudoku-cell ${isFixed ? 'fixed' : 'editable'}" 
                         id="${cellId}" 
                         data-row="${i}" 
                         data-col="${j}"
                         onclick="window.currentGame.selectCell(${i}, ${j})">
                        ${value || ''}
                    </div>
                `;
            }
        }
        gridEl.innerHTML = html;
    }

    renderNumberPad() {
        const pad = document.getElementById('number-pad');
        let html = '';
        for (let i = 1; i <= this.gridSize; i++) {
            html += `<button class="num-btn" onclick="window.currentGame.enterNumber(${i})">${i}</button>`;
        }
        html += `<button class="num-btn clear" onclick="window.currentGame.enterNumber(0)">✕</button>`;
        pad.innerHTML = html;
    }

    selectCell(row, col) {
        // Remove previous selection
        document.querySelectorAll('.sudoku-cell.selected').forEach(c => c.classList.remove('selected'));
        
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (!cell.classList.contains('fixed')) {
            cell.classList.add('selected');
            this.selectedCell = { row, col };
        }
    }

    enterNumber(num) {
        if (!this.selectedCell) return;
        const { row, col } = this.selectedCell;
        this.grid[row][col] = num;
        
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.textContent = num || '';
        cell.classList.remove('wrong');
    }

    checkSolution() {
        let isComplete = true;
        let isCorrect = true;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                if (this.grid[i][j] === 0) {
                    isComplete = false;
                } else if (this.grid[i][j] !== this.solution[i][j]) {
                    isCorrect = false;
                    cell.classList.add('wrong');
                } else {
                    cell.classList.remove('wrong');
                }
            }
        }
        
        if (!isComplete) {
            this.showFeedback('Fill in all cells!', false);
        } else if (isCorrect) {
            const timeBonus = Math.max(0, this.timeLeft);
            const points = (this.gridSize * 100 + timeBonus) * (this.config?.difficulty || 1);
            this.score += points;
            this.correctAnswers++;
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Perfect! 🎉', true);
            setTimeout(() => this.nextRound(), 1500);
        } else {
            this.showFeedback('Some numbers are wrong!', false);
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
        this.selectedCell = null;
        this.resetTimer();
        this.generatePuzzle();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.showFeedback('Time\'s up!', false);
                this.nextRound();
            }
        }, 1000);
    }

    resetTimer() {
        this.timeLeft = this.config?.timeLimit || 180;
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    showFeedback(message, isCorrect) {
        const existing = document.querySelector('.feedback-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1500);
    }

    async endGame() {
        clearInterval(this.timerInterval);
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);

        try {
            const result = await API.submitScore({
                gameType: 'sudokuSolver',
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
                        <div class="result-item"><span class="result-value">${this.correctAnswers}/${this.totalRounds}</span><span class="result-label">Puzzles</span></div>
                    </div>
                    ${result ? `<div class="difficulty-change ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? 'up' : 'down') : 'same'}">
                        ${result.difficultyChanged ? (result.newDifficulty > result.previousDifficulty ? '🎉 Level Up!' : '📉 Level adjusted') : '➡️ Keep practicing!'} 
                        Level: ${result.previousDifficulty} → ${result.newDifficulty}
                    </div>` : ''}
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new SudokuSolverGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}

window.SudokuSolverGame = SudokuSolverGame;
