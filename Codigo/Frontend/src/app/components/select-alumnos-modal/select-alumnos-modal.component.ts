import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { IonHeader, IonButtons, IonToolbar, IonButton, IonTitle, IonContent, IonItem, IonList, IonLabel, IonCheckbox, ModalController, IonRadioGroup, IonRadio } from "@ionic/angular/standalone";
import { GrupoStateService } from '../../services/grupo-state.service';
import { Grupo } from 'src/app/models/grupo.model';

@Component({
  selector: 'app-select-alumnos-modal',
  templateUrl: './select-alumnos-modal.component.html',
  styleUrls: ['./select-alumnos-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonButtons, IonToolbar, IonButton, IonTitle, IonContent, IonItem, IonList, IonLabel, IonCheckbox, IonRadioGroup, IonRadio]
})
export class SelectAlumnosModalComponent implements OnInit {
  @Input() multiple = true;
  alumnos: Usuario[] = [];
  filteredAlumnos: Usuario[] = [];
  selectedAlumnos: Usuario[] = [];
  selectedAlumno: Usuario | null = null;
  searchTerm: string = '';
  private grupoStateService = inject(GrupoStateService);
  private usuarioService = inject(UsuarioService);
  private modalController = inject(ModalController);
  selectedGrupo: Grupo | null = null;
  ngOnInit() {
    this.grupoStateService.selectedGrupo$.subscribe(grupo => {
      this.selectedGrupo = grupo;
      if (grupo) {
        this.alumnos = grupo.alumnos as Usuario[];
        this.filteredAlumnos = [...this.alumnos];
      }
    });
  }

  filterAlumnos() {
    if (this.searchTerm.trim() === '') {
      this.filteredAlumnos = [...this.alumnos];
    } else {
      this.filteredAlumnos = this.alumnos.filter(alumno =>
        alumno.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        alumno.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleAlumnoSelection(alumno: Usuario) {
    if (this.multiple) {
      const index = this.selectedAlumnos.findIndex(a => a._id === alumno._id);
      if (index > -1) {
        this.selectedAlumnos.splice(index, 1);
      } else {
        this.selectedAlumnos.push(alumno);
      }
    } else {
      this.selectedAlumno = alumno;
    }
  }

  isAlumnoSelected(alumno: Usuario): boolean {
    if (this.multiple) {
      return this.selectedAlumnos.some(a => a._id === alumno._id);
    }
    return this.selectedAlumno?._id === alumno._id;
  }

  confirmSelection() {
    if (this.multiple) {
      this.modalController.dismiss(this.selectedAlumnos, 'confirm');
    } else {
      this.modalController.dismiss(this.selectedAlumno, 'confirm');
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }
}
