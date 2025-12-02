import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (this.authService.isAuthenticated()) {
      if (currentUser && currentUser.role === 'administrador') {
        return true;
      } else {
        this.router.navigate(['/Areas']);
        return false;
      }
    } else {
      this.router.navigate(['/Login']);
      return false;
    }
  }
}
