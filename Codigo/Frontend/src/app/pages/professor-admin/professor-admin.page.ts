import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { IonIcon, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
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
  navegarACalificaciones(){
    this.router.navigate(['/Areas/Perfil'], { queryParams: { tool: 'calificaciones' } });
  }
  navegarAMensajes(){
    this.router.navigate(['/Areas/Perfil'], { queryParams: { tool: 'mensajes' } });
  }
}
