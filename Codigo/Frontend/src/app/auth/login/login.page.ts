import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton, IonInput, IonIcon, IonNote } from "@ionic/angular/standalone";
import { sendOutline, keyOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton, IonInput, IonIcon, IonNote]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController);
  usuarioService: UsuarioService = inject(UsuarioService);
  toastController: ToastController = inject(ToastController);

  constructor() {
    addIcons({ 'send-outline': sendOutline, 'key-outline': keyOutline });
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
              this.router.navigate(['/Admin']);
            } else {
              this.router.navigate(['/Areas']);
            }
            this.loginForm.reset();
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

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Introduce tu correo electrónico para enviarte tus credenciales.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'tu.correo@example.com'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              this.usuarioService.enviarCredencialesOlvidadas(data.email).subscribe({
                next: () => {
                  this.presentToast('Se ha enviado un correo con tus nuevas credenciales.', 'success');
                },
                error: (err) => {
                  this.presentToast(err.error.error || 'Error al enviar el correo.', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }
}
