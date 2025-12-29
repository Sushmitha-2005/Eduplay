import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'games', loadComponent: () => import('./pages/games/games.component').then(m => m.GamesComponent), canActivate: [AuthGuard] },
  { path: 'game/:type', loadComponent: () => import('./pages/game-play/game-play.component').then(m => m.GamePlayComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
