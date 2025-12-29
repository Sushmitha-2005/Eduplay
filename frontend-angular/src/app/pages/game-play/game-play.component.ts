import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService, GameConfig, GameResult } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';

interface Question { question: string; answer: any; options?: any[]; }

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="game-container">
      <header class="game-header">
        <button class="btn-back" routerLink="/dashboard">← Exit</button>
        <h2>{{ gameTitle }}</h2>
        <div class="game-info">
          <span class="timer">⏱️ {{ formatTime(timeLeft) }}</span>
          <span class="score">🏆 {{ score }}</span>
          <span class="level">Level {{ config?.difficulty || 1 }}</span>
        </div>
      </header>

      <div class="game-area" *ngIf="!gameOver">
        <!-- Math Reflex -->
        <div *ngIf="gameType === 'mathReflex'" class="math-game">
          <div class="question-number">Question {{ currentQ + 1 }}/{{ totalQuestions }}</div>
          <div class="problem">{{ currentQuestion?.question }}</div>
          <input type="number" [(ngModel)]="userAnswer" (keyup.enter)="submitAnswer()" placeholder="?" autofocus>
          <button class="btn-submit" (click)="submitAnswer()">Submit</button>
        </div>

        <!-- Logic Puzzles / Quick Quiz -->
        <div *ngIf="gameType === 'logicPuzzles' || gameType === 'quickQuiz'" class="quiz-game">
          <div class="question-number">{{ currentQ + 1 }}/{{ totalQuestions }}</div>
          <div class="question">{{ currentQuestion?.question }}</div>
          <div class="options">
            <button *ngFor="let opt of currentQuestion?.options; let i = index"
                    class="option-btn" [class.selected]="selectedOption === i"
                    (click)="selectOption(i, opt)">{{ opt }}</button>
          </div>
        </div>

        <!-- Memory Boost -->
        <div *ngIf="gameType === 'memoryBoost'" class="memory-game">
          <div class="instruction">{{ memoryPhase === 'show' ? 'Memorize!' : 'Repeat the pattern!' }}</div>
          <div class="memory-grid" [style.grid-template-columns]="'repeat(' + gridSize + ', 1fr)'">
            <div *ngFor="let cell of memoryCells; let i = index"
                 class="memory-cell" [class.active]="cell.active" [class.revealed]="cell.revealed"
                 (click)="clickMemoryCell(i)"></div>
          </div>
        </div>

        <!-- Word Builder -->
        <div *ngIf="gameType === 'wordBuilder'" class="word-game">
          <div class="question-number">Round {{ currentQ + 1 }}/{{ totalQuestions }}</div>
          <div class="scrambled">{{ scrambledWord }}</div>
          <div class="user-word">{{ userWord || '_' }}</div>
          <div class="letter-buttons">
            <button *ngFor="let letter of letters; let i = index"
                    class="letter-btn" [class.used]="usedLetters[i]"
                    (click)="addLetter(letter, i)">{{ letter }}</button>
          </div>
          <div class="word-actions">
            <button class="btn-clear" (click)="clearWord()">Clear</button>
            <button class="btn-submit" (click)="submitWord()">Submit</button>
          </div>
        </div>

        <!-- Pattern Match -->
        <div *ngIf="gameType === 'patternMatch'" class="pattern-game">
          <div class="question-number">{{ currentQ + 1 }}/{{ totalQuestions }}</div>
          <div class="pattern-sequence">{{ patternSequence }}</div>
          <div class="options">
            <button *ngFor="let opt of currentQuestion?.options"
                    class="option-btn" (click)="selectPatternOption(opt)">{{ opt }}</button>
          </div>
        </div>

        <!-- Color Hunt -->
        <div *ngIf="gameType === 'colorHunt'" class="color-game">
          <div class="target-color" [style.background]="targetColor">Find this color!</div>
          <div class="color-grid">
            <div *ngFor="let color of colorGrid"
                 class="color-cell" [style.background]="color"
                 (click)="selectColor(color)"></div>
          </div>
        </div>

        <!-- Shape Escape -->
        <div *ngIf="gameType === 'shapeEscape'" class="shape-game">
          <div class="shape-question">{{ shapeQuestion }}</div>
          <div class="shape-options">
            <div *ngFor="let shape of shapeOptions"
                 class="shape-option" (click)="selectShape(shape)">{{ shape }}</div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="results" *ngIf="gameOver">
        <h2>🎯 Game Complete!</h2>
        <div class="stats">
          <div class="stat"><span class="value">{{ score }}</span><span class="label">Score</span></div>
          <div class="stat"><span class="value">{{ accuracy }}%</span><span class="label">Accuracy</span></div>
          <div class="stat"><span class="value">{{ correctAnswers }}/{{ totalQuestions }}</span><span class="label">Correct</span></div>
        </div>
        <div class="level-change" *ngIf="result">
          <span *ngIf="result.difficultyChanged && result.newDifficulty > result.previousDifficulty">
            🎉 Level Up! {{ result.previousDifficulty }} → {{ result.newDifficulty }}
          </span>
          <span *ngIf="result.difficultyChanged && result.newDifficulty < result.previousDifficulty">
            📉 Level: {{ result.previousDifficulty }} → {{ result.newDifficulty }}
          </span>
        </div>
        <div class="result-actions">
          <button class="btn-primary" (click)="playAgain()">Play Again</button>
          <button class="btn-secondary" routerLink="/dashboard">Dashboard</button>
        </div>
      </div>

      <div class="feedback" *ngIf="feedback" [class.correct]="feedbackCorrect" [class.wrong]="!feedbackCorrect">
        {{ feedback }}
      </div>
    </div>
  `,
  styles: [`
    .game-container { min-height: 100vh; background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; }
    .game-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 25px; border-radius: 15px; margin-bottom: 30px; }
    .game-header h2 { margin: 0; color: #333; }
    .game-info { display: flex; gap: 20px; }
    .game-info span { background: #f0f0f0; padding: 8px 15px; border-radius: 10px; font-weight: 600; }
    .btn-back { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #667eea; }
    .game-area { background: white; padding: 40px; border-radius: 20px; max-width: 700px; margin: 0 auto; text-align: center; }
    .question-number { color: #666; margin-bottom: 20px; }
    .problem, .question { font-size: 2rem; font-weight: 600; color: #333; margin-bottom: 30px; white-space: pre-line; }
    input[type="number"] { font-size: 2rem; padding: 15px 20px; border: 3px solid #e0e0e0; border-radius: 15px; width: 150px; text-align: center; margin-right: 15px; }
    input:focus { outline: none; border-color: #667eea; }
    .btn-submit { padding: 15px 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 15px; font-size: 1.2rem; cursor: pointer; }
    .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 500px; margin: 0 auto; }
    .option-btn { padding: 20px; background: #f5f5f5; border: 3px solid transparent; border-radius: 15px; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; }
    .option-btn:hover { border-color: #667eea; background: #f0f0ff; }
    .option-btn.selected { border-color: #667eea; background: #e8ebff; }
    .results { background: white; padding: 50px; border-radius: 20px; max-width: 500px; margin: 0 auto; text-align: center; }
    .results h2 { color: #333; margin-bottom: 30px; }
    .stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; }
    .stat { text-align: center; }
    .stat .value { display: block; font-size: 2.5rem; font-weight: 700; color: #667eea; }
    .stat .label { color: #666; }
    .level-change { padding: 15px; background: #e8f5e9; border-radius: 10px; margin-bottom: 25px; color: #2e7d32; font-weight: 600; }
    .result-actions { display: flex; gap: 15px; justify-content: center; }
    .btn-primary { padding: 15px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-size: 1.1rem; cursor: pointer; }
    .btn-secondary { padding: 15px 30px; background: #f0f0f0; color: #333; border: none; border-radius: 12px; font-size: 1.1rem; cursor: pointer; }
    .feedback { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); padding: 15px 30px; border-radius: 10px; font-weight: 600; animation: fadeIn 0.3s; }
    .feedback.correct { background: #4caf50; color: white; }
    .feedback.wrong { background: #f44336; color: white; }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    .memory-grid { display: grid; gap: 10px; max-width: 400px; margin: 30px auto; }
    .memory-cell { aspect-ratio: 1; background: #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.3s; }
    .memory-cell.active, .memory-cell.revealed { background: #667eea; }
    .instruction { font-size: 1.5rem; color: #667eea; margin-bottom: 20px; }
    .scrambled { font-size: 2.5rem; letter-spacing: 8px; color: #667eea; margin-bottom: 20px; }
    .user-word { font-size: 2rem; color: #333; margin-bottom: 25px; min-height: 50px; }
    .letter-buttons { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 20px; }
    .letter-btn { width: 50px; height: 50px; font-size: 1.5rem; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer; }
    .letter-btn.used { opacity: 0.3; cursor: default; }
    .word-actions { display: flex; gap: 15px; justify-content: center; }
    .btn-clear { padding: 12px 25px; background: #ff9800; color: white; border: none; border-radius: 10px; cursor: pointer; }
    .pattern-sequence { font-size: 2rem; letter-spacing: 5px; margin-bottom: 30px; }
    .target-color { width: 150px; height: 150px; margin: 0 auto 30px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
    .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; max-width: 400px; margin: 0 auto; }
    .color-cell { aspect-ratio: 1; border-radius: 15px; cursor: pointer; transition: transform 0.2s; }
    .color-cell:hover { transform: scale(1.1); }
    .shape-question { font-size: 1.5rem; margin-bottom: 30px; }
    .shape-options { display: flex; justify-content: center; gap: 20px; }
    .shape-option { font-size: 4rem; padding: 20px; background: #f5f5f5; border-radius: 15px; cursor: pointer; }
    .shape-option:hover { background: #e8ebff; }
  `]
})
export class GamePlayComponent implements OnInit, OnDestroy {
  gameType = '';
  gameTitle = '';
  config: GameConfig | null = null;
  score = 0;
  correctAnswers = 0;
  currentQ = 0;
  totalQuestions = 10;
  timeLeft = 0;
  timerInterval: any;
  gameOver = false;
  result: GameResult | null = null;
  startTime = 0;

  currentQuestion: Question | null = null;
  userAnswer: number | null = null;
  selectedOption: number | null = null;
  feedback = '';
  feedbackCorrect = false;
  accuracy = 0;

  // Memory game
  memoryCells: { active: boolean; revealed: boolean }[] = [];
  memoryPattern: number[] = [];
  userPattern: number[] = [];
  memoryPhase: 'show' | 'input' = 'show';
  gridSize = 4;

  // Word game
  currentWord = '';
  scrambledWord = '';
  letters: string[] = [];
  userWord = '';
  usedLetters: boolean[] = [];

  // Pattern game
  patternSequence = '';

  // Color game
  targetColor = '';
  colorGrid: string[] = [];

  // Shape game
  shapeQuestion = '';
  shapeOptions: string[] = [];
  shapeAnswer = '';

  gameTitles: { [key: string]: string } = {
    mathReflex: '🔢 Math Reflex',
    memoryBoost: '🧠 Memory Boost',
    logicPuzzles: '🧩 Logic Puzzles',
    wordBuilder: '📝 Word Builder',
    patternMatch: '🎨 Pattern Match',
    quickQuiz: '⚡ Quick Quiz',
    colorHunt: '🌈 Color Hunt',
    shapeEscape: '🔺 Shape Escape'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.gameType = this.route.snapshot.paramMap.get('type') || 'mathReflex';
    this.gameTitle = this.gameTitles[this.gameType] || 'Game';
    this.loadGame();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadGame(): void {
    this.gameService.getConfig(this.gameType).subscribe({
      next: (config) => {
        this.config = config;
        this.totalQuestions = config.questionsCount || config.roundsCount || config.puzzlesCount || 10;
        this.timeLeft = config.timeLimit || 30;
        this.startTime = Date.now();
        this.initGame();
      },
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  initGame(): void {
    this.currentQ = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.gameOver = false;
    
    switch (this.gameType) {
      case 'mathReflex': this.generateMathQuestion(); break;
      case 'memoryBoost': this.initMemoryGame(); break;
      case 'logicPuzzles': this.generateLogicPuzzle(); break;
      case 'wordBuilder': this.generateWordPuzzle(); break;
      case 'patternMatch': this.generatePatternPuzzle(); break;
      case 'quickQuiz': this.generateQuizQuestion(); break;
      case 'colorHunt': this.generateColorPuzzle(); break;
      case 'shapeEscape': this.generateShapePuzzle(); break;
    }
    this.startTimer();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) this.nextQuestion();
    }, 1000);
  }

  resetTimer(): void {
    this.timeLeft = this.config?.timeLimit || this.config?.timePerQuestion || 30;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Math Reflex
  generateMathQuestion(): void {
    const ops = ['+', '-', '*', '/'];
    const maxNum = this.config?.maxNumber || 20;
    const difficulty = this.config?.difficulty || 1;
    const op = ops[Math.floor(Math.random() * Math.min(difficulty, 4))];
    let n1: number, n2: number, answer: number;

    switch (op) {
      case '+':
        n1 = Math.floor(Math.random() * maxNum) + 1;
        n2 = Math.floor(Math.random() * maxNum) + 1;
        answer = n1 + n2;
        break;
      case '-':
        n1 = Math.floor(Math.random() * maxNum) + 10;
        n2 = Math.floor(Math.random() * n1);
        answer = n1 - n2;
        break;
      case '*':
        n1 = Math.floor(Math.random() * 12) + 1;
        n2 = Math.floor(Math.random() * 12) + 1;
        answer = n1 * n2;
        break;
      default:
        n2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        n1 = n2 * answer;
    }
    this.currentQuestion = { question: `${n1} ${op} ${n2} = ?`, answer };
  }

  submitAnswer(): void {
    if (this.userAnswer === this.currentQuestion?.answer) {
      this.handleCorrect(100);
    } else {
      this.handleWrong();
    }
    this.userAnswer = null;
  }

  // Logic & Quiz
  generateLogicPuzzle(): void {
    const puzzles = [
      { question: 'What comes next? 2, 4, 6, 8, ?', options: ['9', '10', '11', '12'], answer: '10' },
      { question: 'If all A are B, and all B are C, are all A definitely C?', options: ['Yes', 'No', 'Maybe', 'Cannot tell'], answer: 'Yes' },
      { question: 'Tom is taller than Sam. Sam is taller than Bob. Who is shortest?', options: ['Tom', 'Sam', 'Bob', 'Cannot tell'], answer: 'Bob' }
    ];
    this.currentQuestion = puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  generateQuizQuestion(): void {
    const questions = [
      { question: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], answer: 'Paris' },
      { question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: '7' },
      { question: 'What is H2O?', options: ['Salt', 'Sugar', 'Water', 'Acid'], answer: 'Water' }
    ];
    this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
  }

  selectOption(index: number, value: any): void {
    this.selectedOption = index;
    setTimeout(() => {
      if (value === this.currentQuestion?.answer) {
        this.handleCorrect(150);
      } else {
        this.handleWrong();
      }
      this.selectedOption = null;
    }, 300);
  }

  // Memory Boost
  initMemoryGame(): void {
    this.gridSize = Math.min(4 + Math.floor((this.config?.difficulty || 1) / 2), 6);
    const total = this.gridSize * this.gridSize;
    this.memoryCells = Array(total).fill(null).map(() => ({ active: false, revealed: false }));
    this.showPattern();
  }

  showPattern(): void {
    this.memoryPhase = 'show';
    const patternLength = (this.config?.sequenceLength || 3) + this.currentQ;
    this.memoryPattern = [];
    const total = this.memoryCells.length;
    
    while (this.memoryPattern.length < patternLength) {
      const idx = Math.floor(Math.random() * total);
      if (!this.memoryPattern.includes(idx)) this.memoryPattern.push(idx);
    }

    this.memoryPattern.forEach((idx, i) => {
      setTimeout(() => {
        this.memoryCells[idx].active = true;
        setTimeout(() => {
          this.memoryCells[idx].active = false;
          if (i === this.memoryPattern.length - 1) {
            setTimeout(() => { this.memoryPhase = 'input'; this.userPattern = []; }, 500);
          }
        }, 500);
      }, i * 800);
    });
  }

  clickMemoryCell(index: number): void {
    if (this.memoryPhase !== 'input') return;
    this.memoryCells[index].revealed = true;
    this.userPattern.push(index);

    if (this.userPattern.length === this.memoryPattern.length) {
      const correct = this.userPattern.every((v, i) => v === this.memoryPattern[i]);
      if (correct) this.handleCorrect(200);
      else this.handleWrong();
      this.memoryCells.forEach(c => c.revealed = false);
    }
  }

  // Word Builder
  generateWordPuzzle(): void {
    const words = ['apple', 'tiger', 'water', 'bridge', 'garden', 'planet', 'picture', 'mountain'];
    this.currentWord = words[Math.floor(Math.random() * words.length)];
    this.letters = this.shuffleArray(this.currentWord.split(''));
    this.scrambledWord = this.letters.join(' ').toUpperCase();
    this.userWord = '';
    this.usedLetters = new Array(this.letters.length).fill(false);
  }

  addLetter(letter: string, index: number): void {
    if (this.usedLetters[index]) return;
    this.usedLetters[index] = true;
    this.userWord += letter;
  }

  clearWord(): void {
    this.userWord = '';
    this.usedLetters.fill(false);
  }

  submitWord(): void {
    if (this.userWord.toLowerCase() === this.currentWord.toLowerCase()) {
      this.handleCorrect(this.currentWord.length * 50);
    } else {
      this.handleWrong();
    }
  }

  // Pattern Match
  generatePatternPuzzle(): void {
    const patterns = [
      { sequence: '🔴🔵🔴🔵🔴', options: ['🔴', '🔵', '🟢', '🟡'], answer: '🔵' },
      { sequence: 'A B C D E', options: ['E', 'F', 'G', 'A'], answer: 'F' },
      { sequence: '1 2 4 8 16', options: ['24', '32', '20', '18'], answer: '32' }
    ];
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    this.patternSequence = p.sequence + ' → ?';
    this.currentQuestion = { question: p.sequence, answer: p.answer, options: p.options };
  }

  selectPatternOption(opt: string): void {
    if (opt === this.currentQuestion?.answer) this.handleCorrect(150);
    else this.handleWrong();
  }

  // Color Hunt
  generateColorPuzzle(): void {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    this.targetColor = colors[Math.floor(Math.random() * colors.length)];
    this.colorGrid = this.shuffleArray([...colors, ...colors.map(c => this.adjustColor(c))]).slice(0, 16);
    if (!this.colorGrid.includes(this.targetColor)) {
      this.colorGrid[Math.floor(Math.random() * 16)] = this.targetColor;
    }
  }

  adjustColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
  }

  selectColor(color: string): void {
    if (color === this.targetColor) this.handleCorrect(100);
    else this.handleWrong();
  }

  // Shape Escape
  generateShapePuzzle(): void {
    const shapes = ['🔴', '🔵', '🟢', '🟡', '🔺', '🔻', '⬛', '⬜'];
    const questions = [
      { q: 'Which shape has 3 sides?', options: ['🔴', '🔺', '⬛', '🔵'], answer: '🔺' },
      { q: 'Find the circle:', options: ['🔺', '⬛', '🔴', '🔻'], answer: '🔴' },
      { q: 'Which is a square?', options: ['🔴', '🔺', '⬛', '🔵'], answer: '⬛' }
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    this.shapeQuestion = q.q;
    this.shapeOptions = q.options;
    this.shapeAnswer = q.answer;
  }

  selectShape(shape: string): void {
    if (shape === this.shapeAnswer) this.handleCorrect(100);
    else this.handleWrong();
  }

  handleCorrect(points: number): void {
    this.correctAnswers++;
    this.score += points * (this.config?.difficulty || 1);
    this.showFeedback('✓ Correct!', true);
    this.nextQuestion();
  }

  handleWrong(): void {
    this.showFeedback('✗ Wrong!', false);
    this.nextQuestion();
  }

  showFeedback(msg: string, correct: boolean): void {
    this.feedback = msg;
    this.feedbackCorrect = correct;
    setTimeout(() => this.feedback = '', 1500);
  }

  nextQuestion(): void {
    clearInterval(this.timerInterval);
    this.currentQ++;
    
    if (this.currentQ >= this.totalQuestions) {
      this.endGame();
      return;
    }
    
    this.resetTimer();
    this.initGame();
  }

  endGame(): void {
    clearInterval(this.timerInterval);
    this.gameOver = true;
    this.accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);

    this.gameService.submitScore({
      gameType: this.gameType,
      score: this.score,
      correctAnswers: this.correctAnswers,
      totalQuestions: this.totalQuestions,
      timeTaken
    }).subscribe({
      next: (res) => {
        this.result = res;
        this.authService.updateUserSkillLevel(this.gameType, res.newDifficulty);
      },
      error: () => {}
    });
  }

  playAgain(): void {
    this.loadGame();
  }

  shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
