import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem, IonIcon, AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-gestion-alumnos-modal',
  templateUrl: './gestion-alumnos-modal.component.html',
  styleUrls: ['./gestion-alumnos-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem, IonIcon]
})
export class GestionAlumnosModalComponent implements OnInit {
  alumnos: Usuario[] = [];
  modalController: ModalController = inject(ModalController);
  usuarioService: UsuarioService = inject(UsuarioService);
  authService: AuthService = inject(AuthService);
  toastController: ToastController = inject(ToastController);
  alertController: AlertController = inject(AlertController); // Inject AlertController

  constructor() {
    addIcons({ trashOutline });
  }

  ngOnInit() {
    this.loadAlumnos();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  loadAlumnos() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser._id) {
      this.usuarioService.getAlumnosByProfesor(currentUser._id).subscribe({
        next: (alumnos) => {
          this.alumnos = alumnos;
        },
        error: (err) => {
          this.presentToast(`Error al cargar alumnos: ${err.error.error || err.message}`, 'danger');
          console.error('Error al cargar alumnos:', err);
        }
      });
    }
  }

  async deleteAlumno(alumnoId: string) {
    if (!alumnoId) {
      this.presentToast('ID de alumno no válido.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar a este alumno? Se eliminarán todos sus datos asociados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.usuarioService.deleteUsuario(alumnoId).subscribe({
              next: () => {
                this.presentToast('Alumno eliminado correctamente.', 'success');
                this.loadAlumnos(); // Reload the list after deletion
              },
              error: (err) => {
                this.presentToast(`Error al eliminar alumno: ${err.error.error || err.message}`, 'danger');
                console.error('Error al eliminar alumno:', err);
              }
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
