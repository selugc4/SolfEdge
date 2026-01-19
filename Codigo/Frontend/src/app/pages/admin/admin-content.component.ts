import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GestionProfesoresComponent } from '../../components/gestion-profesores/gestion-profesores.component';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';
import { CalificacionGeneralModalComponent } from '../../components/calificacion-general-modal/calificacion-general-modal.component';
import { ModalController, ToastController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSpinner, AlertController, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";
import { UsuarioService } from '../../services/usuario.service';
import { closeCircle, documentTextOutline, cloudUploadOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-admin-content',
  templateUrl: './admin-content.component.html',
  styleUrls: ['./admin-content.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, GestionProfesoresComponent, GestionAlumnosComponent, GestionGruposComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, IonText]
})
export class AdminContentComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  userRole: string | undefined;
  userId: string | null = null;
  authService: AuthService = inject(AuthService);
  modalController: ModalController = inject(ModalController);
  mensajeService: MensajeService = inject(MensajeService);
  toastController: ToastController = inject(ToastController);
  usuarioService: UsuarioService = inject(UsuarioService); // Inyectar UsuarioService
  alertController: AlertController = inject(AlertController); // Inyectar AlertController
  isLoading: boolean = false; // Initialized to false, as it's not a global page loader anymore
  isLoadingCsv: boolean = false; // Specific loader for CSV import
  selectedFile: File | undefined; // Para almacenar el archivo seleccionado

  constructor(){
    addIcons({closeCircle, documentTextOutline, cloudUploadOutline})
  }
  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userRole = user?.role;
      this.userId = user?._id || null;
      // No need to set isLoading to false here, as it's not a global loader
    });
  }

  fileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    } else {
      this.selectedFile = undefined;
    }
  }

  clearFileSelection() {
    this.selectedFile = undefined;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = ''; // Clear the input field
    }
  }

  async uploadCsv() {
    if (!this.selectedFile) {
      this.presentToast('Por favor, selecciona un archivo CSV para subir.', 'danger');
      return;
    }

    this.isLoadingCsv = true; // Mostrar spinner específico para CSV
    this.usuarioService.importCsv(this.selectedFile).subscribe({
      next: (response) => {
        this.presentToast('Importación completada: ' + response.message, 'success');
        this.clearFileSelection(); // Limpiar el archivo seleccionado y el input
        // Optionally, refresh data here if needed
      },
      error: (err) => {
        const errorMessage =
          err?.error?.error ||
          err?.error?.message ||
          (Array.isArray(err?.error?.errors) ? err.error.errors.join(' | ') : null) ||
          err?.message ||
          'Error desconocido al importar CSV.';
        this.presentToast(`Error al importar CSV: ${errorMessage}`, 'danger');
        this.clearFileSelection();
        this.isLoadingCsv = false;
      },
      complete: () => {
        this.isLoadingCsv = false;
      }
    });
  }

  async presentMensajeModal() {
    const modal = await this.modalController.create({
      component: MensajeModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (!this.userId) {
        this.presentToast('Error: ID de profesor no disponible.', 'danger');
        return;
      }
      this.mensajeService.crearMensaje(this.userId, data.asunto, data.texto, data.alumnoIds).subscribe({
        next: () => {
          this.presentToast('Mensaje enviado con éxito.');
        },
        error: (err) => {
          this.presentToast(`Error al enviar mensaje: ${err.error.message || err.message}`, 'danger');
        }
      });
    }
  }

  async presentCalificacionGeneralModal() {
    const modal = await this.modalController.create({
      component: CalificacionGeneralModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.presentToast('Funcionalidad pendiente: Requiere un endpoint en el backend para calificaciones generales.', 'warning');
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

