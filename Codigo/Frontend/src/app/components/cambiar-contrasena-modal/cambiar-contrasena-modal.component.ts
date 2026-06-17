import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, ModalController, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-cambiar-contrasena-modal',
  templateUrl: './cambiar-contrasena-modal.component.html',
  styleUrls: ['./cambiar-contrasena-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons]
})
export class CambiarContrasenaModalComponent {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private usuarioService = inject(UsuarioService);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      antiguaContrasena: ['', Validators.required],
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      ]]
    });
  }

  dismiss(role: string = 'cancel') {
    this.modalCtrl.dismiss(null, role);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.presentToast('Por favor, revisa los campos. La contraseña requiere 8 caracteres, mayúscula, minúscula, número y carácter especial.', 'danger');
      return;
    }

    this.usuarioService.cambiarContrasena(this.form.value.antiguaContrasena, this.form.value.nuevaContrasena).subscribe({
      next: () => {
        this.presentToast('Contraseña cambiada con éxito.', 'success');
        this.dismiss('confirm');
      },
      error: (err) => {
        this.presentToast(err.error?.error || 'Error al cambiar la contraseña.', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
