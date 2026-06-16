import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuario.model';
import { Grupo } from '../../models/grupo.model';
import { RamaConfigService } from '../../services/rama-config.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { GrupoService } from '../../services/grupo.service';
import { TareaService } from 'src/app/services/tarea.service';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonSelectOption, IonInput, IonFooter, ModalController, ToastController, IonTextarea, IonSelect, IonIcon, IonList } from "@ionic/angular/standalone";
import { documentAttachOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-tarea-modal',
  templateUrl: './tarea-modal.component.html',
  styleUrls: ['./tarea-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonSelectOption, IonInput, IonFooter, IonTextarea, IonSelect, IonIcon, IonList]
})
export class TareaModalComponent implements OnInit {
  @Input() tarea: Tarea | null = null;
  @Input() rama: 'Ritmo' | 'Entonación' | 'Audición' | 'Teoría' = 'Teoría';
  @Input() alumnos: Usuario[] = [];
  @Input() currentGroup: Grupo | null = null;
  form: FormGroup;
  selectedFile: File | null = null;
  minDate: string;
  modalCtrl: ModalController = inject(ModalController);
  toastCtrl: ToastController = inject(ToastController);
  ramaConfigService: RamaConfigService = inject(RamaConfigService);
  authService: AuthService = inject(AuthService);
  usuarioService: UsuarioService = inject(UsuarioService);
  grupoService: GrupoService = inject(GrupoService);
  tareaService: TareaService = inject(TareaService);

  nuevaTarea: Tarea;
  studentsInSelectedGroups: Usuario[] = [];
  selectedStudentsFromGroups: string[] = [];

  constructor() {
    addIcons({
      'document-attach-outline': documentAttachOutline
    });
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];
    const user = this.authService.currentUserValue;
    const profesorId = user ? user._id : '';

    this.nuevaTarea = {
      _id: '',
      titulo: '',
      descripcion: '',
      profesor: profesorId,
      materialDeApoyo: '',
      cerrada: false,
      rama: this.rama,
      alumnos: [],
      fechaCierre: Date.now() as unknown as Date
    };

    this.form = new FormGroup({
      titulo: new FormControl(this.nuevaTarea.titulo, [Validators.required]),
      descripcion: new FormControl(this.nuevaTarea.descripcion, [Validators.required]),
      selectedStudentsFromGroups: new FormControl([]),
      fechaCierre: new FormControl(null)
    });
  }

  async ngOnInit() {
    if (this.currentGroup) {
      this.studentsInSelectedGroups = this.currentGroup.alumnos as Usuario[];
      this.selectedStudentsFromGroups = this.studentsInSelectedGroups.map(alumno => alumno._id);
      this.form.get('selectedStudentsFromGroups')?.setValue(this.selectedStudentsFromGroups);
    }

    if (this.tarea) {
      this.form.patchValue(this.tarea);
      if (this.tarea.fechaCierre) {
        const fechaCierre = new Date(this.tarea.fechaCierre);
        this.form.patchValue({ fechaCierre: fechaCierre.toISOString().split('T')[0] });
      }
      if (this.tarea.alumnos && this.currentGroup) {
        this.selectedStudentsFromGroups = this.currentGroup.alumnos
          .filter(alumno => this.tarea?.alumnos.includes(alumno._id as string))
          .map(alumno => alumno._id as string);
        this.form.get('selectedStudentsFromGroups')?.setValue(this.selectedStudentsFromGroups);
      }
    } else {
      this.form.patchValue({ rama: this.rama });
    }
  }

  onStudentsFromGroupsChange(event: any) {
    this.selectedStudentsFromGroups = event.detail.value;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.presentToast('Archivo PDF seleccionado.', 'success');
    } else {
      this.selectedFile = null;
      this.presentToast('Por favor, selecciona un archivo PDF.', 'danger');
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if (this.form.valid) {
      let finalAlumnos: string[] = this.alumnos.map(alumno => alumno._id);
      finalAlumnos.push(...this.selectedStudentsFromGroups);
      finalAlumnos = [...new Set(finalAlumnos)];

      if (finalAlumnos.length === 0) {
        this.presentToast('La tarea debe tener al menos un alumno.', 'danger');
        return;
      }

      const profesorId = this.authService.currentUserValue?._id || '';

      const taskData: any = {
        titulo: this.form.value.titulo,
        descripcion: this.form.value.descripcion,
        rama: this.rama,
        fechaCierre: this.form.value.fechaCierre,
        ...(this.selectedFile ? {} : { materialDeApoyo: null }),
        alumnos: finalAlumnos,
        profesorId: profesorId
      };

      if (this.tarea && this.tarea._id) {
        taskData._id = this.tarea._id;
      }

      return this.modalCtrl.dismiss({ taskData: JSON.stringify(taskData), selectedFile: this.selectedFile }, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos.', 'warning');
    return;
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}

