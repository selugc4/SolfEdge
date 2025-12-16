import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CalificacionService } from '../services/calificacion.service';
import { CalificacionGeneralService } from '../services/calificacion-general.service';
import { Usuario } from '../models/usuario.model';
import { PerfilCalificacion } from '../models/perfil-calificacion.model';
import { CalificacionGeneral } from '../models/calificacionGeneral.model';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList, IonSpinner, IonSegment, IonSegmentButton, IonListHeader, IonNote, IonButton, IonIcon, ToastController, ModalController } from '@ionic/angular/standalone';
import { MensajeService } from '../services/mensaje.service';
import { Mensaje } from '../models/mensaje.model';
import { ribbonOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GrupoStateService } from '../services/grupo-state.service';
import { Grupo } from '../models/grupo.model';
import { CalificacionGeneralModalComponent } from '../components/calificacion-general-modal/calificacion-general-modal.component';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader,
    IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonText,
    IonList, IonSpinner, IonSegment, IonSegmentButton,
    IonListHeader, IonNote,
    IonButton,
    IonIcon
]
})
export class Tab5Page implements OnInit {
  authService: AuthService = inject(AuthService);
  calificacionService: CalificacionService = inject(CalificacionService);
  calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);
  mensajeService: MensajeService = inject(MensajeService);
  grupoService: GrupoStateService = inject(GrupoStateService);
  selectedGrupo: Grupo | null = null;
  mensajes: Mensaje[] = [];
  currentUser: Usuario | null = null;
  toastController: ToastController = inject(ToastController);
  calificacionesContinuas: PerfilCalificacion[] = [];
  calificacionesGeneralesList: CalificacionGeneral[] = [];
  modalController: ModalController = inject(ModalController);
  isLoading: boolean = true;
  segmentoSeleccionado: string = 'continuas';
  constructor() {
    addIcons({
      'ribbon-outline': ribbonOutline
    });
  }
  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.grupoService.selectedGrupo$.subscribe(grupo => {
        if (grupo) {
          this.selectedGrupo = grupo;
          if(user?.role === 'alumno'){
            this.loadAllGrades(user!._id, grupo._id);
          }
          this.isLoading = false;
        }
      });
    });
  }
  loadAllGrades(alumnoId: string, grupoId: string) {
    forkJoin({
      continuas: this.calificacionService.getCalificacionesByAlumno(alumnoId, grupoId),
      generales: this.calificacionGeneralService.getCalificacionesByAlumnoAndGrupo(alumnoId, grupoId)
    }).subscribe({
      next: ({ continuas, generales }) => {
        this.calificacionesContinuas = continuas;
        this.calificacionesGeneralesList = generales;
      },
      error: (err) => {
        console.error('Error fetching grades', err);
      }
    });
  }

  getNotaPorTipo(tipo: 'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria'): number | null {
    const calificacion = this.calificacionesGeneralesList.find(g => g.tipo === tipo);
    return calificacion ? calificacion.nota : null;
  }
  async presentCalificacionGeneralModal() {
    if (!this.selectedGrupo) {
      await this.presentToast('Por favor, selecciona un grupo primero.', 'warning');
      return;
    }
    if (!this.currentUser!._id) {
      await this.presentToast('Error: ID de profesor no disponible para calificar.', 'danger');
      return;
    }

    const modal = await this.modalController.create({
      component: CalificacionGeneralModalComponent,
      componentProps: {
        grupoId: this.selectedGrupo._id
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.calificacionGeneralService.crearOActualizarCalificacion(
        data.alumnoId,
        this.selectedGrupo._id,
        data.selectedTipo,
        data.nota,
        this.currentUser!._id
      ).subscribe({
        next: async (calificacion) => {
          await this.presentToast(`Calificación '${calificacion.tipo}' guardada para ${data.alumnoUsername}.`);
        },
        error: async (err) => {
          console.error('Error al guardar calificación general:', err);
          const errorMessage = err.error && err.error.error ? err.error.error : 'Error al guardar la calificación general.';
          await this.presentToast(errorMessage, 'danger');
        }
      });
    }
  }
  segmentChanged(event: any) {
    this.segmentoSeleccionado = event.detail.value;
  }
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
