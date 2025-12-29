// Puzzle Blocks - Arrange blocks/shapes to solve spatial puzzles
class PuzzleBlocksGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 8;
        this.correctAnswers = 0;
        this.startTime = null;
        this.grid = [];
        this.targetShape = [];
        this.blocks = [];
        this.selectedBlock = null;
        this.gridSize = 4;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('puzzleBlocks');
            this.gridSize = 3 + Math.floor((this.config.difficulty || 1) / 3);
            this.startTime = Date.now();
            this.render();
            this.generatePuzzle();
        } catch (error) {
            this.config = { difficulty: 1 };
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
                    <h2>🧱 Puzzle Blocks</h2>
                    <div class="game-info">
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Puzzle <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div class="word-instruction">Fill the grid to match the target pattern!</div>
                    <div class="puzzle-layout">
                        <div class="target-section">
                            <h4>Target:</h4>
                            <div id="target-grid" class="block-grid target"></div>
                        </div>
                        <div class="play-section">
                            <h4>Your Grid:</h4>
                            <div id="play-grid" class="block-grid"></div>
                        </div>
                    </div>
                    <div class="blocks-palette" id="blocks-palette"></div>
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
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        this.targetShape = Array(size).fill(null).map(() => Array(size).fill(0));
        
        // Generate target pattern
        const difficulty = this.config?.difficulty || 1;
        const fillCount = Math.min(3 + difficulty + this.currentRound, size * size - 2);
        
        const positions = [];
        for (let i = 0; i < size * size; i++) positions.push(i);
        this.shuffleArray(positions);
        
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
        this.blocks = [];
        
        for (let i = 0; i < fillCount; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / size);
            const col = pos % size;
            const colorIdx = i % colors.length;
            this.targetShape[row][col] = colorIdx + 1;
            this.blocks.push({ color: colors[colorIdx], id: colorIdx + 1 });
        }
        
        // Remove duplicates from blocks palette
        const uniqueBlocks = [...new Map(this.blocks.map(b => [b.id, b])).values()];
        this.blocks = uniqueBlocks;
        
        this.renderGrids();
        this.renderPalette();
    }

    renderGrids() {
        const size = this.gridSize;
        const colors = ['', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
        
        // Target grid
        const targetEl = document.getElementById('target-grid');
        targetEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        targetEl.innerHTML = this.targetShape.flat().map((val, i) => 
            `<div class="block-cell" style="background:${val ? colors[val] : '#ddd'}"></div>`
        ).join('');
        
        // Play grid
        const playEl = document.getElementById('play-grid');
        playEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        playEl.innerHTML = this.grid.flat().map((val, i) => {
            const row = Math.floor(i / size);
            const col = i % size;
            return `<div class="block-cell clickable" style="background:${val ? colors[val] : '#f0f0f0'}" 
                    onclick="window.currentGame.placeBlock(${row}, ${col})"></div>`;
        }).join('');
    }

    renderPalette() {
        const colors = ['', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
        const palette = document.getElementById('blocks-palette');
        palette.innerHTML = this.blocks.map(b => 
            `<div class="palette-block ${this.selectedBlock === b.id ? 'selected' : ''}" 
                 style="background:${b.color}" 
                 onclick="window.currentGame.selectBlock(${b.id})"></div>`
        ).join('') + 
        `<div class="palette-block eraser ${this.selectedBlock === 0 ? 'selected' : ''}" 
             onclick="window.currentGame.selectBlock(0)">✕</div>`;
    }

    selectBlock(blockId) {
        this.selectedBlock = blockId;
        this.renderPalette();
    }

    placeBlock(row, col) {
        if (this.selectedBlock === null) return;
        this.grid[row][col] = this.selectedBlock;
        this.renderGrids();
    }

    clearGrid() {
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.renderGrids();
    }

    checkSolution() {
        let correct = true;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== this.targetShape[i][j]) {
                    correct = false;
                    break;
                }
            }
        }
        
        if (correct) {
            this.correctAnswers++;
            this.score += 200 * (this.config?.difficulty || 1);
            document.getElementById('score').textContent = this.score;
            this.showFeedback('Perfect! 🎉', true);
            setTimeout(() => this.nextRound(), 1500);
        } else {
            this.showFeedback('Not quite right, try again!', false);
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
        this.selectedBlock = null;
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
                gameType: 'puzzleBlocks',
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
                        <button class="btn btn-primary" onclick="window.currentGame = new PuzzleBlocksGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.PuzzleBlocksGame = PuzzleBlocksGame;
