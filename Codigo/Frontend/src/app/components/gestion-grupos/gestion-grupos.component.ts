import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from '../../models/usuario.model';
import { GrupoService } from '../../services/grupo.service';
import { Grupo } from '../../models/grupo.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrls: ['./gestion-grupos.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GestionGruposComponent implements OnInit {
  nombreGrupo: string = '';
  selectedAlumnos: Usuario[] = [];

  private modalController = inject(ModalController);
  private grupoService = inject(GrupoService);
  private toastController = inject(ToastController);
  private authService = inject(AuthService);

  constructor() { }

  ngOnInit() {}

  async openSelectAlumnosModal() {
    const modal = await this.modalController.create({
      component: SelectAlumnosModalComponent,
      componentProps: {
        selectedAlumnos: this.selectedAlumnos // Pass already selected students
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

  async crearGrupo() {
    if (!this.nombreGrupo || this.selectedAlumnos.length === 0) {
      this.presentToast('Por favor, introduce un nombre para el grupo y selecciona al menos un alumno.', 'danger');
      return;
    }

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
