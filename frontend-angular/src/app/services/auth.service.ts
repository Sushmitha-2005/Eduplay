import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  skillLevels: { [key: string]: number };
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = 'https://eduplay-4.onrender.com/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('eduplay_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem('eduplay_token', res.token);
    localStorage.setItem('eduplay_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  logout(): void {
    localStorage.removeItem('eduplay_token');
    localStorage.removeItem('eduplay_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('eduplay_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserSkillLevel(gameType: string, level: number): void {
    const user = this.currentUserSubject.value;
    if (user) {
      user.skillLevels[gameType] = level;
      localStorage.setItem('eduplay_user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
}
