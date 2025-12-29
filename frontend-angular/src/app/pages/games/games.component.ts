import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="games-page">
      <header class="header">
        <h1 routerLink="/dashboard">🎓 EduPlay</h1>
        <h2>Choose Your Game</h2>
      </header>
      <div class="games-grid">
        <div class="game-card" *ngFor="let game of games" [routerLink]="['/game', game.type]">
          <div class="game-icon">{{ game.icon }}</div>
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <span class="level">Level {{ getSkillLevel(game.type) }}</span>
        </div>
      </div>
      <div class="back-link">
        <a routerLink="/dashboard">← Back to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .games-page { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: white; margin: 0; cursor: pointer; }
    .header h2 { color: rgba(255,255,255,0.9); margin-top: 10px; }
    .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; max-width: 1200px; margin: 0 auto; }
    .game-card { background: white; padding: 30px; border-radius: 20px; text-align: center; cursor: pointer; transition: all 0.3s; }
    .game-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    .game-icon { font-size: 4rem; margin-bottom: 15px; }
    .game-card h3 { margin: 0 0 10px; color: #333; font-size: 1.4rem; }
    .game-card p { color: #666; margin: 0 0 15px; }
    .level { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; }
    .back-link { text-align: center; margin-top: 40px; }
    .back-link a { color: white; text-decoration: none; font-size: 1.1rem; }
  `]
})
export class GamesComponent {
  games = [
    { type: 'mathReflex', name: 'Math Reflex', icon: '🔢', description: 'Solve math problems under time pressure!' },
    { type: 'memoryBoost', name: 'Memory Boost', icon: '🧠', description: 'Train your memory with patterns' },
    { type: 'logicPuzzles', name: 'Logic Puzzles', icon: '🧩', description: 'Challenge your reasoning skills' },
    { type: 'wordBuilder', name: 'Word Builder', icon: '📝', description: 'Unscramble letters to form words' },
    { type: 'patternMatch', name: 'Pattern Match', icon: '🎨', description: 'Find and complete patterns' },
    { type: 'quickQuiz', name: 'Quick Quiz', icon: '⚡', description: 'Test your general knowledge' },
    { type: 'colorHunt', name: 'Color Hunt', icon: '🌈', description: 'Find matching colors quickly' },
    { type: 'shapeEscape', name: 'Shape Escape', icon: '🔺', description: 'Navigate through shape puzzles' }
  ];

  constructor(private authService: AuthService) {}

  getSkillLevel(gameType: string): number {
    return this.authService.getCurrentUser()?.skillLevels?.[gameType] || 1;
  }
}
