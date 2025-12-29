// Word Search - Find words in a grid
class WordSearchGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 5;
        this.wordsFound = 0;
        this.startTime = null;
        this.grid = [];
        this.words = [];
        this.foundWords = [];
        this.gridSize = 8;
        this.selecting = false;
        this.selectedCells = [];
    }

    async init() {
        try {
            this.config = await API.getGameConfig('wordSearch');
            this.gridSize = 6 + Math.floor((this.config.difficulty || 1) / 2);
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
                    <h2>🔍 Word Search</h2>
                    <div class="game-info">
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                        <span class="level">Level ${this.config?.difficulty || 1}</span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="progress-info">Round <span id="round">${this.currentRound + 1}</span>/${this.totalRounds}</div>
                    <div id="word-list" class="word-list"></div>
                    <div id="search-grid" class="search-grid"></div>
                </div>
            </div>
        `;
    }

    generatePuzzle() {
        const wordBank = [
            ['CAT', 'DOG', 'SUN', 'RUN'],
            ['APPLE', 'WATER', 'EARTH', 'LIGHT'],
            ['PLANET', 'FOREST', 'OCEAN', 'DESERT'],
            ['SCIENCE', 'HISTORY', 'NATURE', 'ENERGY'],
            ['COMPUTER', 'MOUNTAIN', 'ELEPHANT', 'EDUCATION']
        ];
        
        const level = Math.min(this.config?.difficulty || 1, 5) - 1;
        this.words = [...wordBank[level]].slice(0, 3);
        this.foundWords = [];
        
        // Initialize grid with empty cells
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
        
        // Place words
        this.words.forEach(word => this.placeWord(word));
        
        // Fill remaining with random letters
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x]) {
                    this.grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
        
        this.renderGrid();
        this.renderWordList();
    }

    placeWord(word) {
        const directions = [[1, 0], [0, 1], [1, 1]]; // horizontal, vertical, diagonal
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const maxX = this.gridSize - (dir[0] * word.length);
            const maxY = this.gridSize - (dir[1] * word.length);
            
            if (maxX > 0 && maxY > 0) {
                const startX = Math.floor(Math.random() * maxX);
                const startY = Math.floor(Math.random() * maxY);
                
                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    const x = startX + dir[0] * i;
                    const y = startY + dir[1] * i;
                    if (this.grid[y][x] && this.grid[y][x] !== word[i]) {
                        canPlace = false;
                        break;
                    }
                }
                
                if (canPlace) {
                    for (let i = 0; i < word.length; i++) {
                        const x = startX + dir[0] * i;
                        const y = startY + dir[1] * i;
                        this.grid[y][x] = word[i];
                    }
                    placed = true;
                }
            }
            attempts++;
        }
    }

    renderGrid() {
        const gridEl = document.getElementById('search-grid');
        gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        let html = '';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                html += `<div class="search-cell" data-x="${x}" data-y="${y}" 
                         onmousedown="window.currentGame.startSelect(${x},${y})"
                         onmouseenter="window.currentGame.continueSelect(${x},${y})"
                         onmouseup="window.currentGame.endSelect()">${this.grid[y][x]}</div>`;
            }
        }
        gridEl.innerHTML = html;
    }

    renderWordList() {
        const listEl = document.getElementById('word-list');
        listEl.innerHTML = this.words.map(word => 
            `<span class="word-item ${this.foundWords.includes(word) ? 'found' : ''}">${word}</span>`
        ).join('');
    }

    startSelect(x, y) {
        this.selecting = true;
        this.selectedCells = [{x, y}];
        this.highlightCells();
    }

    continueSelect(x, y) {
        if (!this.selecting) return;
        const last = this.selectedCells[this.selectedCells.length - 1];
        if (Math.abs(x - last.x) <= 1 && Math.abs(y - last.y) <= 1) {
            if (!this.selectedCells.find(c => c.x === x && c.y === y)) {
                this.selectedCells.push({x, y});
                this.highlightCells();
            }
        }
    }

    endSelect() {
        if (!this.selecting) return;
        this.selecting = false;
        
        const selectedWord = this.selectedCells.map(c => this.grid[c.y][c.x]).join('');
        const reversedWord = selectedWord.split('').reverse().join('');
        
        if (this.words.includes(selectedWord) && !this.foundWords.includes(selectedWord)) {
            this.foundWords.push(selectedWord);
            this.markFound();
        } else if (this.words.includes(reversedWord) && !this.foundWords.includes(reversedWord)) {
            this.foundWords.push(reversedWord);
            this.markFound();
        }
        
        this.clearHighlight();
        this.renderWordList();
        
        if (this.foundWords.length === this.words.length) {
            this.score += 500 * (this.config?.difficulty || 1);
            this.wordsFound += this.words.length;
            document.getElementById('score').textContent = this.score;
            this.showFeedback('All words found! 🎉', true);
            setTimeout(() => this.nextRound(), 1500);
        }
    }

    highlightCells() {
        document.querySelectorAll('.search-cell').forEach(c => c.classList.remove('selecting'));
        this.selectedCells.forEach(({x, y}) => {
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add('selecting');
        });
    }

    clearHighlight() {
        document.querySelectorAll('.search-cell').forEach(c => c.classList.remove('selecting'));
        this.selectedCells = [];
    }

    markFound() {
        this.selectedCells.forEach(({x, y}) => {
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add('found');
        });
        this.showFeedback('Word found!', true);
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
        try {
            const result = await API.submitScore({
                gameType: 'wordSearch',
                score: this.score,
                correctAnswers: this.wordsFound,
                totalQuestions: this.totalRounds * 3,
                timeTaken
            });
            this.showResults(result);
        } catch (error) {
            this.showResults(null);
        }
    }

    showResults(result) {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-results">
                    <h2>🎯 Game Complete!</h2>
                    <div class="results-stats">
                        <div class="result-item"><span class="result-value">${this.score}</span><span class="result-label">Score</span></div>
                        <div class="result-item"><span class="result-value">${this.wordsFound}</span><span class="result-label">Words Found</span></div>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new WordSearchGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.WordSearchGame = WordSearchGame;
