import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonInput, IonIcon, AlertController, ToastController, ModalController } from "@ionic/angular/standalone";
import { GestionProfesoresModalComponent } from '../gestion-profesores-modal/gestion-profesores-modal.component';
import { personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-gestion-profesores',
  templateUrl: './gestion-profesores.component.html',
  styleUrls: ['./gestion-profesores.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonInput, IonIcon]
})
export class GestionProfesoresComponent implements OnInit {
  professorForm: FormGroup;
  modalController: ModalController = inject(ModalController);

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
    addIcons({ personCircleOutline });
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

  async presentGestionProfesoresModal() {
    const modal = await this.modalController.create({
      component: GestionProfesoresModalComponent,
    });
    modal.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
