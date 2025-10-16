import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuToggle, IonItem, IonIcon, IonLabel, ModalController, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseSharp, logOutSharp, notificationsSharp } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { RouterLink } from '@angular/router';
import { Grupo } from './models/grupo.model';
import { GrupoService } from './services/grupo.service';
import { GrupoStateService } from './services/grupo-state.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuToggle, IonItem, IonIcon, IonLabel, RouterLink, IonSelect, IonSelectOption, FormsModule
  ],
})
export class AppComponent {
  isAdminOrProfessor = false;
  isAdministrator = false;
  grupos: Grupo[] = [];
  selectedGrupo: Grupo | null = null;

  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  modalController: ModalController = inject(ModalController);
  grupoService: GrupoService = inject(GrupoService);
  grupoStateService: GrupoStateService = inject(GrupoStateService);

  constructor() {
    addIcons({ briefcaseSharp, logOutSharp, notificationsSharp });
    this.authService.currentUser.subscribe(user => {
      this.isAdminOrProfessor = user?.role === 'profesor' || user?.role === 'administrador';
      this.isAdministrator = user?.role === 'administrador';
      if (user) {
        this.grupoService.getGruposByUsuario(user._id).subscribe(grupos => {
          this.grupos = grupos;
          if (this.grupos.length > 0) {
            this.selectedGrupo = this.grupos[0];
            this.grupoStateService.setSelectedGrupo(this.selectedGrupo);
          }
        });
      }
    });
  }

  onGrupoChange(event: any) {
    this.selectedGrupo = event.detail.value;
    this.grupoStateService.setSelectedGrupo(this.selectedGrupo);
  }

  logout() {
    this.authService.logout();
    this.grupoStateService.setSelectedGrupo(null);
    this.router.navigate(['/login']);
  }


}
