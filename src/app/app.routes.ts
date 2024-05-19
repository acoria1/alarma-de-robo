import { Routes } from '@angular/router';
import { authGuardFn } from './guards/auth.guard';
import { notAuthGuardFn } from './guards/notAuth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuardFn],
    canDeactivate : [notAuthGuardFn]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./logni/logni.page').then( m => m.LogniPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage),
  },
  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.page').then( m => m.SplashPage),
  }
];
