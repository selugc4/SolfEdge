import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-gestion-profesores',
  templateUrl: './gestion-profesores.component.html',
  styleUrls: ['./gestion-profesores.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton]
})
export class GestionProfesoresComponent implements OnInit {
  professorForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.professorForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'), Validators.maxLength(20)]),
      primerApellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'), Validators.maxLength(20)]),
      segundoApellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'), Validators.maxLength(20)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^\S*$/), Validators.maxLength(40)])
    });
  }

  ngOnInit() {}

  onNameInput(event: any, controlName: string) {
    let input = event.target.value;
    input = input.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
    if (input.length > 20) {
      input = input.substring(0, 20);
    }
    this.professorForm.get(controlName)?.setValue(input, { emitEvent: false });
  }

  onEmailInput(event: any) {
    let input = event.target.value;
    input = input.replace(/\s/g, '');
    if (input.length > 40) {
      input = input.substring(0, 40);
    }
    this.professorForm.get('email')?.setValue(input, { emitEvent: false });
  }

  async createProfessor() {
    if (!this.professorForm.valid) {
      this.presentToast('Por favor, rellena todos los campos correctamente.');
      return;
    }

    const { nombre, primerApellido, segundoApellido, email } = this.professorForm.value;
    const baseUsername = (nombre[0] + primerApellido[0] + segundoApellido[0]).toLowerCase();
    const professorData = { email, baseUsername };

    this.usuarioService.crearProfesores([professorData]).subscribe({
      next: async (response) => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: `Profesor creado. Usuario: ${response[0].username}, Contraseña: la contraseña por defecto.`,
          buttons: ['OK']
        });
        await alert.present();
        this.professorForm.reset();
      },
      error: async (err) => {
        let errorMessage = 'No se pudo crear el profesor.';
        if (err.status === 409 && err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        const alert = await this.alertController.create({
          header: 'Error',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
