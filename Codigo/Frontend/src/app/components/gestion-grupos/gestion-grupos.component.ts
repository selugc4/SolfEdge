import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from '../../models/usuario.model';
import { GrupoService } from '../../services/grupo.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonItem, IonButton, IonList, IonListHeader, IonLabel, IonIcon, IonInput, ModalController, ToastController} from "@ionic/angular/standalone";

@Component({
  selector: 'app-gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrls: ['./gestion-grupos.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonItem, IonButton, IonList, IonListHeader, IonLabel, IonIcon, IonInput]
})
export class GestionGruposComponent implements OnInit {
  nombreGrupo: string = '';
  selectedAlumnos: Usuario[] = [];

  private modalController = inject(ModalController);
  private grupoService = inject(GrupoService);
  private toastController = inject(ToastController);
  private authService = inject(AuthService);
  private grupoStateService = inject(GrupoStateService);

  constructor() { }

  ngOnInit() {}

  async openSelectAlumnosModal() {
    const modal = await this.modalController.create({
      component: SelectAlumnosModalComponent,
      componentProps: {
        previouslySelectedAlumnos: this.selectedAlumnos, // Pass already selected students
        fetchAllAlumnos: true
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.selectedAlumnos = data;
    }
  }

  removeAlumno(alumnoToRemove: Usuario) {
    this.selectedAlumnos = this.selectedAlumnos.filter(alumno => alumno._id !== alumnoToRemove._id);
  }

  onNombreGrupoInput(event: any) {
    let input = event.target.value;
    input = input.replace(/[^a-zA-Z0-9_-]/g, '');
    if (input.length > 20) {
      input = input.substring(0, 20);
    }
    this.nombreGrupo = input;
  }

  async crearGrupo() {
    if (!this.nombreGrupo || this.selectedAlumnos.length === 0) {
      this.presentToast('Por favor, introduce un nombre para el grupo y selecciona al menos un alumno.', 'danger');
      return;
    }

    // No need for explicit space check here, as onNombreGrupoInput already filters invalid characters


    const profesorId = this.authService.currentUserValue?._id;
    if (!profesorId) {
      this.presentToast('Error: No se pudo obtener el ID del profesor.', 'danger');
      return;
    }

    const alumnoIds = this.selectedAlumnos.map(alumno => alumno._id);

    this.grupoService.crearGrupo(this.nombreGrupo, profesorId, alumnoIds).subscribe({
      next: (grupoCreado) => {
        this.presentToast(`Grupo '${grupoCreado.nombre}' creado con éxito.`, 'success');
        this.nombreGrupo = '';
        this.selectedAlumnos = [];
        this.grupoStateService.addGrupo(grupoCreado);
      },
      error: (err) => {
        this.presentToast(`Error al crear el grupo: ${err.error.message || err.message}`, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
