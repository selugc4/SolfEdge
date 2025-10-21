import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuToggle, IonItem, IonIcon, IonLabel, ModalController, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseSharp, logOutSharp, notificationsSharp, peopleSharp } from 'ionicons/icons';
import { AuthService } from './services/auth.service';
import { RouterLink } from '@angular/router';
import { Grupo } from './models/grupo.model';
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
export class AppComponent implements OnInit {
  @ViewChild('groupSelect') groupSelect!: IonSelect;
  isAdminOrProfessor = false;
  isAdministrator = false;
  grupos: Grupo[] = [];
  selectedGrupo: Grupo | null = null;

  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  modalController: ModalController = inject(ModalController);
  grupoStateService: GrupoStateService = inject(GrupoStateService);

  constructor() {
    addIcons({ briefcaseSharp, logOutSharp, notificationsSharp, peopleSharp });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.isAdminOrProfessor = user?.role === 'profesor' || user?.role === 'administrador';
      this.isAdministrator = user?.role === 'administrador';
      if (user) {
        this.grupoStateService.refreshGrupos();
      } else {
        this.grupos = [];
        this.selectedGrupo = null;
      }
    });

    this.grupoStateService.grupos$.subscribe(grupos => {
      this.grupos = grupos;
      if (this.grupos.length > 0 && !this.selectedGrupo) {
        this.grupoStateService.setSelectedGrupo(this.grupos[0]);
      }
    });

    this.grupoStateService.selectedGrupo$.subscribe(grupo => {
      this.selectedGrupo = grupo;
    });
  }

  onGrupoChange(event: any) {
    this.grupoStateService.setSelectedGrupo(event.detail.value);
  }

  openGroupSelect() {
    this.groupSelect.open();
  }

  compareGrupos(g1: Grupo, g2: Grupo) {
    return g1 && g2 ? g1._id === g2._id : g1 === g2;
  }

  logout() {
    this.authService.logout();
    this.grupoStateService.setSelectedGrupo(null);
    this.router.navigate(['/login']);
  }
}
