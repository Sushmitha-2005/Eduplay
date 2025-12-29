// Emoji Pairs - Memory matching game with emojis
class EmojiPairsGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.config = null;
        this.score = 0;
        this.moves = 0;
        this.pairs = 0;
        this.startTime = null;
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.canFlip = true;
    }

    async init() {
        try {
            this.config = await API.getGameConfig('emojiPairs');
            this.startTime = Date.now();
            this.render();
            this.generateCards();
        } catch (error) {
            this.config = { difficulty: 1 };
            this.startTime = Date.now();
            this.render();
            this.generateCards();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <button class="btn-exit" onclick="window.app.showDashboard()">← Exit</button>
                    <h2>🙂🙃 Emoji Pairs</h2>
                    <div class="game-info">
                        <span>Moves: <span id="moves">0</span></span>
                        <span>Pairs: <span id="pairs">0</span></span>
                        <span class="score">🏆 <span id="score">${this.score}</span></span>
                    </div>
                </div>
                <div class="game-area">
                    <div class="word-instruction">Find all matching emoji pairs!</div>
                    <div id="cards-grid" class="emoji-grid"></div>
                </div>
            </div>
        `;
    }

    generateCards() {
        const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎹', '🎸', '🎺', '🎻', '🥁', '🎲', '🎰', '🎳'];
        const difficulty = this.config?.difficulty || 1;
        const pairCount = Math.min(4 + Math.floor(difficulty / 2), 8);
        
        const selectedEmojis = emojis.slice(0, pairCount);
        this.cards = [...selectedEmojis, ...selectedEmojis];
        this.shuffleArray(this.cards);
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.pairs = 0;
        
        this.renderCards();
    }

    renderCards() {
        const gridEl = document.getElementById('cards-grid');
        const cols = this.cards.length <= 8 ? 4 : (this.cards.length <= 12 ? 4 : 4);
        gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        gridEl.innerHTML = this.cards.map((emoji, i) => `
            <div class="emoji-card ${this.matched.includes(i) ? 'matched' : ''} ${this.flipped.includes(i) ? 'flipped' : ''}" 
                 data-index="${i}" onclick="window.currentGame.flipCard(${i})">
                <div class="card-inner">
                    <div class="card-front">❓</div>
                    <div class="card-back">${emoji}</div>
                </div>
            </div>
        `).join('');
    }

    flipCard(index) {
        if (!this.canFlip || this.flipped.includes(index) || this.matched.includes(index)) return;
        
        this.flipped.push(index);
        this.renderCards();
        
        if (this.flipped.length === 2) {
            this.canFlip = false;
            this.moves++;
            document.getElementById('moves').textContent = this.moves;
            
            const [first, second] = this.flipped;
            
            if (this.cards[first] === this.cards[second]) {
                this.matched.push(first, second);
                this.pairs++;
                this.score += 100 * (this.config?.difficulty || 1);
                document.getElementById('pairs').textContent = this.pairs;
                document.getElementById('score').textContent = this.score;
                this.flipped = [];
                this.canFlip = true;
                this.renderCards();
                
                if (this.matched.length === this.cards.length) {
                    setTimeout(() => this.endGame(), 500);
                }
            } else {
                setTimeout(() => {
                    this.flipped = [];
                    this.canFlip = true;
                    this.renderCards();
                }, 1000);
            }
        }
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    async endGame() {
        const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
        const bonus = Math.max(0, 500 - this.moves * 10);
        this.score += bonus;

        try {
            const result = await API.submitScore({
                gameType: 'emojiPairs',
                score: this.score,
                correctAnswers: this.pairs,
                totalQuestions: this.cards.length / 2,
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
                    <h2>🎉 All Pairs Found!</h2>
                    <div class="results-stats">
                        <div class="result-item"><span class="result-value">${this.score}</span><span class="result-label">Score</span></div>
                        <div class="result-item"><span class="result-value">${this.moves}</span><span class="result-label">Moves</span></div>
                        <div class="result-item"><span class="result-value">${this.pairs}</span><span class="result-label">Pairs</span></div>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="window.currentGame = new EmojiPairsGame('game-container'); window.currentGame.init();">Play Again</button>
                        <button class="btn btn-secondary" onclick="window.app.showDashboard()">Dashboard</button>
                    </div>
                </div>
            </div>
        `;
    }
}
window.EmojiPairsGame = EmojiPairsGame;
