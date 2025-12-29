import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';
import { IonIcon, ModalController, ToastController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';
import { sendOutline, ribbonOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
@Component({
  selector: 'app-professor-admin-page',
  templateUrl: './professor-admin.page.html',
  styleUrls: ['./professor-admin.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, GestionAlumnosComponent, GestionGruposComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon, IonSpinner]
})
export class ProfessorAdminPage implements OnInit {
  userId: string | null = null;

  isLoading: boolean = true;
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  modalController: ModalController = inject(ModalController);
  mensajeService: MensajeService = inject(MensajeService);
  toastController: ToastController = inject(ToastController);
  grupoStateService: GrupoStateService = inject(GrupoStateService);
  calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      this.isLoading = false;
    });
  }
  constructor() {
    addIcons({
      'send-outline': sendOutline,
      'ribbon-outline': ribbonOutline
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
  navegarAPerfil(){
    this.router.navigate(['/Areas/Perfil'], { queryParams: { openModal: 'true' } });
  }
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
