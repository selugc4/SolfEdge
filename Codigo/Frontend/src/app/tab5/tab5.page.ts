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
import { IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList, IonSpinner, IonSegment, IonSegmentButton, IonListHeader, IonNote, ToastController, ModalController, IonButton } from '@ionic/angular/standalone';
import { MensajeService } from '../services/mensaje.service';
import { Mensaje } from '../models/mensaje.model';
import { ribbonOutline, sendOutline, peopleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GrupoStateService } from '../services/grupo-state.service';
import { Grupo } from '../models/grupo.model';
import { MensajeModalComponent } from '../components/mensaje-modal/mensaje-modal.component';
import { CalificacionGeneralModalComponent } from '../components/calificacion-general-modal/calificacion-general-modal.component';
import { GestionGrupoModalComponent } from '../components/gestion-grupo-modal/gestion-grupo-modal.component';
import { CambiarContrasenaModalComponent } from '../components/cambiar-contrasena-modal/cambiar-contrasena-modal.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  imports: [
    CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader,
    IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonText,
    IonList, IonSpinner, IonSegment, IonSegmentButton,
    IonListHeader, IonNote,
    IonButton
]
})
export class Tab5Page implements OnInit {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
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
      'ribbon-outline': ribbonOutline,
      'send-outline': sendOutline,
      'people-outline': peopleOutline
    });
  }
  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.grupoService.selectedGrupo$.subscribe(grupo => {
          this.selectedGrupo = grupo;
          if (user.role === 'alumno' && grupo) {
            this.loadAllGrades(user._id, grupo._id);
          }
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
      }
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
  segmentChanged(event: any) {
    this.segmentoSeleccionado = event.detail.value;
  }

  async presentCambiarContrasenaModal() {
    const modal = await this.modalController.create({
      component: CambiarContrasenaModalComponent,
    });
    await modal.present();
  }

  async presentToast(message: string, color: string = 'success') {

    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
