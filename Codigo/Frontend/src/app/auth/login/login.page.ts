import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController);
  constructor() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {}

  async login() {
    if (!this.loginForm.valid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.authService.verifyAndFetchUser().subscribe({
          next: () => {
            const userRole = this.authService.currentUserValue?.role;
            if (userRole === 'administrador') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/tabs']);
            }
          },
          error: async (err) => {
            await this.presentErrorAlert(err.error.error || 'Error al verificar el usuario.');
          }
        });
      },
      error: async (err) => {
        await this.presentErrorAlert(err.error.error || 'Error al iniciar sesión.');
        this.loginForm.reset();
      }
    });
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de Autenticación',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
