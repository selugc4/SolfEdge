import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-gestion-alumnos',
  templateUrl: './gestion-alumnos.component.html',
  styleUrls: ['./gestion-alumnos.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton]
})
export class GestionAlumnosComponent implements OnInit {
  studentForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.studentForm = new FormGroup({
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
    this.studentForm.get(controlName)?.setValue(input, { emitEvent: false });
  }

  onEmailInput(event: any) {
    let input = event.target.value;
    input = input.replace(/\s/g, '');
    if (input.length > 40) {
      input = input.substring(0, 40);
    }
    this.studentForm.get('email')?.setValue(input, { emitEvent: false });
  }

  async createStudent() {
    if (!this.studentForm.valid) {
      this.presentToast('Por favor, rellena todos los campos correctamente.');
      return;
    }

    const { nombre, primerApellido, segundoApellido, email } = this.studentForm.value;
    const baseUsername = (nombre[0] + primerApellido[0] + segundoApellido[0]).toLowerCase();
    const studentData = { email, baseUsername };

    this.usuarioService.crearAlumnos([studentData]).subscribe({
      next: async (response) => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: `Alumno creado. Usuario: ${response[0].username}, Contraseña: la contraseña por defecto.`,
          buttons: ['OK']
        });
        await alert.present();
        this.studentForm.reset();
      },
      error: async (err) => {
        let errorMessage = 'No se pudo crear el alumno.';
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
