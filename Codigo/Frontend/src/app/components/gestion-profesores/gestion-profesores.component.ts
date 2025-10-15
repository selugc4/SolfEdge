import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-gestion-profesores',
  templateUrl: './gestion-profesores.component.html',
  styleUrls: ['./gestion-profesores.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class GestionProfesoresComponent implements OnInit {
  professorForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.professorForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]),
      primerApellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]),
      segundoApellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  ngOnInit() {}

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
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error.message || 'No se pudo crear el profesor.',
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
