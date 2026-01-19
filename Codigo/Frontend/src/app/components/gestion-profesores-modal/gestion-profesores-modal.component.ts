import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem, IonIcon, AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';
import { trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-gestion-profesores-modal',
  templateUrl: './gestion-profesores-modal.component.html',
  styleUrls: ['./gestion-profesores-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem, IonIcon]
})
export class GestionProfesoresModalComponent implements OnInit {
  profesores: Usuario[] = [];
  modalController: ModalController = inject(ModalController);
  usuarioService: UsuarioService = inject(UsuarioService);
  toastController: ToastController = inject(ToastController);
  alertController: AlertController = inject(AlertController); // Inject AlertController

  constructor() {
    addIcons({ trashOutline });
  }

  ngOnInit() {
    this.loadProfesores();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  loadProfesores() {
    this.usuarioService.getAllProfesores().subscribe({
      next: (profesores) => {
        this.profesores = profesores;
      },
      error: (err) => {
        this.presentToast(`Error al cargar profesores: ${err.error.error || err.message}`, 'danger');
        console.error('Error al cargar profesores:', err);
      }
    });
  }

  async deleteProfesor(profesorId: string) {
    if (!profesorId) {
      this.presentToast('ID de profesor no válido.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar a este profesor? Se eliminarán todos sus datos asociados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.usuarioService.deleteUsuario(profesorId).subscribe({
              next: () => {
                this.presentToast('Profesor eliminado correctamente.', 'success');
                this.profesores = this.profesores.filter(profesor => profesor._id !== profesorId);
              },
              error: (err) => {
                this.presentToast(`Error al eliminar profesor: ${err.error.error || err.message}`, 'danger');
                console.error('Error al eliminar profesor:', err);
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
