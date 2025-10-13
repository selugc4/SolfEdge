import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-header',
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SharedHeaderComponent {

  @Input() title: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'administrador';
  }

  isStudent(): boolean {
    return this.authService.getUserRole() === 'alumno';
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}