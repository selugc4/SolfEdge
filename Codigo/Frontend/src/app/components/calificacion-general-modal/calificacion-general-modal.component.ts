import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, IonLabel, IonContent, IonItem, IonFooter, IonInput, ModalController, ToastController, IonSelect, IonSelectOption, IonNote} from "@ionic/angular/standalone";
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from '../../models/usuario.model';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';
import { CalificacionGeneral } from '../../models/calificacionGeneral.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calificacion-general-modal',
  templateUrl: './calificacion-general-modal.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, IonLabel, IonContent, IonItem, IonFooter, IonInput, IonSelect, IonSelectOption, IonNote
  ]
})
export class CalificacionGeneralModalComponent implements OnInit {
  @Input() grupoId!: string;
  form: FormGroup;
  selectedAlumno: Usuario | null = null;
  selectedTipo: 'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria' | null = null;
  tiposCalificacion: Array<'Q1' | 'Q2' | 'Q3' | 'Ordinaria' | 'Extraordinaria'> = ['Q1', 'Q2', 'Q3', 'Ordinaria', 'Extraordinaria'];
  calificacionesExistentes: CalificacionGeneral[] = [];
  ordinariaNota: number | null = null;
  profesorId: string | null = null;

  private modalController: ModalController = inject(ModalController);
  private toastController: ToastController = inject(ToastController);
  private calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);
  private authService: AuthService = inject(AuthService);

  constructor() {
    this.form = new FormGroup({
      alumnoId: new FormControl('', [Validators.required]),
      nota: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern(/^[0-9]*$/)])
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.profesorId = user?._id || null;
    });
  }

  async openSelectAlumnosModal() {
    const modal = await this.modalController.create({
      component: SelectAlumnosModalComponent,
      componentProps: {
        multiple: false
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.selectedAlumno = data;
      if (this.selectedAlumno) {
        this.form.controls['alumnoId'].setValue(this.selectedAlumno._id);
        this.cargarCalificacionesExistentes(); // Load grades for the newly selected student
      }
    }
  }

  async cargarCalificacionesExistentes() {
    if (this.selectedAlumno && this.grupoId) {
      this.calificacionGeneralService.getCalificacionesByAlumnoAndGrupo(this.selectedAlumno._id, this.grupoId).subscribe({
        next: (calificaciones) => {
          this.calificacionesExistentes = calificaciones;
          const ordinaria = this.calificacionesExistentes.find(c => c.tipo === 'Ordinaria');
          this.ordinariaNota = ordinaria ? ordinaria.nota : null;
        },
        error: (err) => {
          console.error('Error al cargar calificaciones existentes:', err);
          this.calificacionesExistentes = [];
          this.ordinariaNota = null;
          // Not necessarily an error, could just be no grades yet (404)
        }
      });
    }
  }

  onTipoChange(event: any) {
    this.selectedTipo = event.detail.value;
  }

  get showExtraordinariaOption(): boolean {
    return this.ordinariaNota !== null && this.ordinariaNota < 5;
  }

  isFormValid(): boolean {
    return this.form.valid && !!this.selectedAlumno && !!this.selectedTipo;
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  async guardarCalificacion() {
    if (!this.isFormValid()) {
      await this.presentToast('Por favor, completa todos los campos y asegúrate de que la nota sea un número entero entre 1 y 10.');
      return;
    }

    if (!this.selectedTipo) {
        await this.presentToast('Por favor, selecciona un tipo de calificación.');
        return;
    }

    if (this.selectedTipo === 'Extraordinaria' && !this.showExtraordinariaOption) {
        await this.presentToast('No se puede guardar una calificación Extraordinaria si la Ordinaria es >= 5 o no existe.');
        return;
    }

    const { alumnoId, nota } = this.form.value;

    this.calificacionGeneralService.crearOActualizarCalificacion(
      alumnoId,
      this.grupoId,
      this.selectedTipo,
      nota,
      this.profesorId || undefined // Pass profesorId if available
    ).subscribe({
      next: async (calificacion) => {
        await this.presentToast(`Calificación '${calificacion.tipo}' guardada exitosamente.`);
        this.modalController.dismiss(calificacion, 'confirm');
      },
      error: async (err) => {
        console.error('Error al guardar calificación:', err);
        const errorMessage = err.error && err.error.error ? err.error.error : 'Error al guardar la calificación.';
        await this.presentToast(errorMessage);
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
