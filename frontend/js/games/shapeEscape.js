// Shape Escape Game - Fixed with fallback defaults
class ShapeEscapeGame {
    constructor() {
        this.config = null;
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.currentAnswer = null;
    }

    async start() {
        try {
            this.config = await GamesAPI.getConfig('shapeEscape');
        } catch (error) {
            console.log('Using default config for Shape Escape');
            this.config = { difficulty: 1, rounds: 8 };
        }
        this.config.rounds = this.config.rounds || 8;
        this.config.difficulty = this.config.difficulty || 1;
        this.resetGame();
        this.renderGame();
        this.nextRound();
    }

    resetGame() {
        this.currentRound = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
    }

    renderGame() {
        document.getElementById('gameArea').innerHTML = `
            <div class="shape-game-container">
                <div class="word-instruction">Which shape is different?</div>
                <div class="shape-grid" id="shapeGrid"></div>
                <div class="progress-info" id="shapeProgress">Round 0 / ${this.config.rounds}</div>
            </div>
        `;
        document.getElementById('gameDifficulty').textContent = `Level: ${this.config.difficulty}`;
        document.getElementById('currentGameTitle').textContent = '🔺 Shape Escape';
    }

    nextRound() {
        if (this.currentRound >= this.config.rounds) {
            this.endGame();
            return;
        }
        this.currentRound++;
        this.generateShapes();
        document.getElementById('shapeProgress').textContent = `Round ${this.currentRound} / ${this.config.rounds}`;
    }

    generateShapes() {
        const shapes = ['●', '■', '▲', '◆', '★', '♥', '♦', '♣', '♠', '✦'];
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
        
        const mainShape = shapes[Math.floor(Math.random() * shapes.length)];
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        
        const diffIndex = Math.floor(Math.random() * 6);
        this.currentAnswer = diffIndex;
        
        // Different shape options
        const diffOptions = [
            shapes.filter(s => s !== mainShape)[Math.floor(Math.random() * (shapes.length - 1))],
            colors.filter(c => c !== mainColor)[Math.floor(Math.random() * (colors.length - 1))],
        ];
        
        const useDiffShape = Math.random() > 0.5;
        const diffShape = useDiffShape ? diffOptions[0] : mainShape;
        const diffColor = useDiffShape ? mainColor : diffOptions[1];
        
        let gridHTML = '';
        for (let i = 0; i < 6; i++) {
            const isOdd = i === diffIndex;
            const shape = isOdd ? diffShape : mainShape;
            const color = isOdd ? diffColor : mainColor;
            gridHTML += `<div class="shape-cell" style="color:${color};font-size:3rem;cursor:pointer;" onclick="shapeGame.checkAnswer(${i})">${shape}</div>`;
        }
        
        document.getElementById('shapeGrid').innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">${gridHTML}</div>`;
    }

    checkAnswer(index) {
        const cells = document.querySelectorAll('.shape-cell');
        cells.forEach((cell, i) => {
            cell.style.pointerEvents = 'none';
            if (i === this.currentAnswer) {
                cell.style.background = '#00E676';
                cell.style.borderRadius = '10px';
            } else if (i === index && index !== this.currentAnswer) {
                cell.style.background = '#FF5252';
                cell.style.borderRadius = '10px';
            }
        });
        
        if (index === this.currentAnswer) {
            this.correctAnswers++;
            this.score += 120 * this.config.difficulty;
            document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        }
        setTimeout(() => this.nextRound(), 1200);
    }

    async endGame() {
        const totalTime = Math.round((Date.now() - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.config.rounds) * 100);
        try { await GamesAPI.submitScore({ gameType: 'shapeEscape', score: this.score, correctAnswers: this.correctAnswers, totalQuestions: this.config.rounds, timeTaken: totalTime }); } catch (e) {}
        document.getElementById('gameArea').innerHTML = `
            <div class="game-results">
                <h2>🔺 Game Complete!</h2>
                <div class="results-stats">
                    <div class="result-item"><div class="result-value">${this.score}</div><div class="result-label">Score</div></div>
                    <div class="result-item"><div class="result-value">${accuracy}%</div><div class="result-label">Accuracy</div></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="startGame('shapeEscape')">Play Again</button>
                    <button class="btn btn-secondary" onclick="exitGame()">Exit</button>
                </div>
            </div>
        `;
    }
}

let shapeGame = new ShapeEscapeGame();
