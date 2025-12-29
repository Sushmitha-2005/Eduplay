import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>🎓 EduPlay</h1>
          <p>Join the Learning Adventure!</p>
        </div>
        <form (ngSubmit)="register()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username" required placeholder="Choose username">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="Enter email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Create password">
          </div>
          <div *ngIf="error" class="error-message">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>
        <p class="auth-switch">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .auth-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .auth-header h1 { font-size: 2.5rem; margin: 0; color: #667eea; }
    .auth-header p { color: #666; margin-top: 10px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
    .form-group input { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; box-sizing: border-box; }
    .form-group input:focus { outline: none; border-color: #667eea; }
    .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .error-message { background: #fee; color: #c00; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; }
    .auth-switch { text-align: center; margin-top: 20px; color: #666; }
    .auth-switch a { color: #667eea; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
