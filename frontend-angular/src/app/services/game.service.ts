import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface GameConfig {
  difficulty: number;
  timeLimit: number;
  questionsCount?: number;
  roundsCount?: number;
  maxNumber?: number;
  operations?: string[];
  categories?: string[];
  gridSize?: number;
  sequenceLength?: number;
  wordLength?: number;
  puzzlesCount?: number;
  puzzleComplexity?: number;
  timePerQuestion?: number;
}

export interface GameResult {
  newDifficulty: number;
  previousDifficulty: number;
  difficultyChanged: boolean;
  score: number;
  accuracy: number;
}

export interface ScoreSubmission {
  gameType: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private apiUrl = 'https://eduplay-4.onrender.com/api/games';
  private performanceUrl = 'https://eduplay-4.onrender.com/api/performance';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getConfig(gameType: string): Observable<GameConfig> {
    return this.http.get<GameConfig>(`${this.apiUrl}/config/${gameType}`, {
      headers: this.getHeaders()
    });
  }

  submitScore(data: ScoreSubmission): Observable<GameResult> {
    return this.http.post<GameResult>(`${this.apiUrl}/submit`, data, {
      headers: this.getHeaders()
    });
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.performanceUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  getRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.performanceUrl}/recommendations`, {
      headers: this.getHeaders()
    });
  }
}
