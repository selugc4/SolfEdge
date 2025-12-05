import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CalificacionService } from '../services/calificacion.service';
import { CalificacionGeneralService } from '../services/calificacion-general.service';
import { Usuario } from '../models/usuario.model';
import { Calificacion } from '../models/calificacion.model';
import { CalificacionGeneral } from '../models/calificacionGeneral.model';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList, IonSpinner, IonSegment, IonSegmentButton, IonListHeader, IonNote } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList, IonSpinner, IonSegment, IonSegmentButton, IonListHeader, IonNote]
})
export class Tab5Page implements OnInit {
  authService: AuthService = inject(AuthService);
  calificacionService: CalificacionService = inject(CalificacionService);
  calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);

  currentUser: Usuario | null = null;
  calificacionesContinuas: Calificacion[] = [];
  calificacionesGeneralesList: CalificacionGeneral[] = [];
  isLoading: boolean = true;
  segmentoSeleccionado: string = 'continuas';

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user?._id && user.role === 'alumno' && user.grupoId) {
        this.loadAllGrades(user._id, user.grupoId);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadAllGrades(alumnoId: string, grupoId: string) {
    this.isLoading = true;
    forkJoin({
      continuas: this.calificacionService.getCalificacionesByAlumno(alumnoId),
      generales: this.calificacionGeneralService.getCalificacionesByAlumnoAndGrupo(alumnoId, grupoId)
    }).subscribe({
      next: ({ continuas, generales }) => {
        this.calificacionesContinuas = continuas;
        this.calificacionesGeneralesList = generales;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching grades', err);
        this.isLoading = false;
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
}
