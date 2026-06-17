import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class WelcomeGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (localStorage.getItem('hasSeenWelcome')) {
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
