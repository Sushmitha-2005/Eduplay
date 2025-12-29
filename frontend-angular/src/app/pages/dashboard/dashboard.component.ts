import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>🎓 EduPlay</h1>
        <div class="user-info">
          <span>Welcome, {{ user?.username }}!</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="content">
        <section class="stats-section">
          <h2>📊 Your Progress</h2>
          <div class="skill-cards">
            <div class="skill-card" *ngFor="let game of games">
              <span class="skill-icon">{{ game.icon }}</span>
              <span class="skill-name">{{ game.name }}</span>
              <div class="skill-bar">
                <div class="skill-fill" [style.width.%]="getSkillLevel(game.type) * 10"></div>
              </div>
              <span class="skill-level">Level {{ getSkillLevel(game.type) }}</span>
            </div>
          </div>
        </section>

        <section class="recommendations" *ngIf="recommendations.length">
          <h2>💡 Recommendations</h2>
          <div class="rec-list">
            <div class="rec-item" *ngFor="let rec of recommendations">
              <span class="rec-icon">{{ getGameIcon(rec.gameType) }}</span>
              <div class="rec-content">
                <strong>{{ rec.gameName }}</strong>
                <p>{{ rec.message }}</p>
              </div>
              <button class="btn-play" [routerLink]="['/game', rec.gameType]">Play</button>
            </div>
          </div>
        </section>

        <section class="games-section">
          <h2>🎮 Play Games</h2>
          <div class="games-grid">
            <div class="game-card" *ngFor="let game of games" [routerLink]="['/game', game.type]">
              <div class="game-icon">{{ game.icon }}</div>
              <h3>{{ game.name }}</h3>
              <p>{{ game.description }}</p>
              <span class="game-level">Level {{ getSkillLevel(game.type) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { min-height: 100vh; background: #f5f7fa; }
    .header { background: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header h1 { margin: 0; color: #667eea; }
    .user-info { display: flex; align-items: center; gap: 15px; }
    .btn-logout { padding: 8px 16px; background: #ff4757; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .content { padding: 30px; max-width: 1200px; margin: 0 auto; }
    section { margin-bottom: 40px; }
    section h2 { color: #333; margin-bottom: 20px; }
    .skill-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }
    .skill-card { background: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .skill-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
    .skill-name { font-weight: 600; display: block; margin-bottom: 10px; }
    .skill-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .skill-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 4px; transition: width 0.5s; }
    .skill-level { color: #667eea; font-weight: 600; font-size: 0.9rem; }
    .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .game-card { background: white; padding: 25px; border-radius: 20px; text-align: center; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
    .game-icon { font-size: 3rem; margin-bottom: 15px; }
    .game-card h3 { margin: 0 0 10px; color: #333; }
    .game-card p { color: #666; font-size: 0.9rem; margin: 0 0 15px; }
    .game-level { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; }
    .rec-list { display: flex; flex-direction: column; gap: 15px; }
    .rec-item { background: white; padding: 20px; border-radius: 15px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .rec-icon { font-size: 2rem; }
    .rec-content { flex: 1; }
    .rec-content strong { display: block; color: #333; }
    .rec-content p { margin: 5px 0 0; color: #666; font-size: 0.9rem; }
    .btn-play { padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  recommendations: any[] = [];
  
  games = [
    { type: 'mathReflex', name: 'Math Reflex', icon: '🔢', description: 'Solve math problems fast!' },
    { type: 'memoryBoost', name: 'Memory Boost', icon: '🧠', description: 'Train your memory' },
    { type: 'logicPuzzles', name: 'Logic Puzzles', icon: '🧩', description: 'Challenge your reasoning' },
    { type: 'wordBuilder', name: 'Word Builder', icon: '📝', description: 'Unscramble words' },
    { type: 'patternMatch', name: 'Pattern Match', icon: '🎨', description: 'Find the pattern' },
    { type: 'quickQuiz', name: 'Quick Quiz', icon: '⚡', description: 'Test your knowledge' },
    { type: 'colorHunt', name: 'Color Hunt', icon: '🌈', description: 'Match colors fast' },
    { type: 'shapeEscape', name: 'Shape Escape', icon: '🔺', description: 'Navigate shapes' }
  ];

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.gameService.getRecommendations().subscribe({
      next: (recs) => this.recommendations = recs,
      error: () => {}
    });
  }

  getSkillLevel(gameType: string): number {
    return this.user?.skillLevels?.[gameType] || 1;
  }

  getGameIcon(gameType: string): string {
    return this.games.find(g => g.type === gameType)?.icon || '🎮';
  }

  logout(): void {
    this.authService.logout();
  }
}
