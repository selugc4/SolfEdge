import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';
import { IonHeader, IonButtons, IonToolbar, IonButton, IonTitle, IonContent, IonItem, IonList, IonLabel, IonCheckbox } from "@ionic/angular/standalone";

@Component({
  selector: 'app-select-alumnos-modal',
  templateUrl: './select-alumnos-modal.component.html',
  styleUrls: ['./select-alumnos-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonButtons, IonToolbar, IonButton, IonTitle, IonContent, IonItem, IonList, IonLabel, IonCheckbox]
})
export class SelectAlumnosModalComponent implements OnInit {
  alumnos: Usuario[] = [];
  filteredAlumnos: Usuario[] = [];
  selectedAlumnos: Usuario[] = [];
  searchTerm: string = '';

  private authService = inject(AuthService);
  private modalController = inject(ModalController);

  ngOnInit() {
    this.loadAlumnos();
  }

  loadAlumnos() {
    this.authService.getAllAlumnos().subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos;
        this.filteredAlumnos = [...this.alumnos];
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
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
    const index = this.selectedAlumnos.findIndex(a => a._id === alumno._id);
    if (index > -1) {
      this.selectedAlumnos.splice(index, 1);
    } else {
      this.selectedAlumnos.push(alumno);
    }
  }

  isAlumnoSelected(alumno: Usuario): boolean {
    return this.selectedAlumnos.some(a => a._id === alumno._id);
  }

  confirmSelection() {
    this.modalController.dismiss(this.selectedAlumnos, 'confirm');
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }
}
