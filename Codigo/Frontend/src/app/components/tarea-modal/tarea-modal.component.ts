import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuario.model';
import { Grupo } from '../../models/grupo.model';
import { RamaConfigService } from '../../services/rama-config.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { GrupoService } from '../../services/grupo.service';
import { TareaService } from 'src/app/services/tarea.service';

@Component({
  selector: 'app-tarea-modal',
  templateUrl: './tarea-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class TareaModalComponent implements OnInit {
  @Input() tarea: Tarea | null = null;
  @Input() rama: 'Ritmo' | 'Entonación' | 'Audición' | 'Teoría' = 'Teoría';
  @Input() alumnos: Usuario[] = []; // This is the initial pool of students
  @Input() currentGroup: Grupo | null = null;
  form: FormGroup;
  selectedFile: File | null = null;
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
    const user = this.authService.currentUserValue;
    const profesorId = user ? user._id : '';

    this.nuevaTarea = {
      _id: '',
      titulo: '',
      descripcion: '',
      profesorId: profesorId,
      materialDeApoyo: '',
      cerrada: false,
      rama: this.rama,
      alumnos: []
    };

    this.form = new FormGroup({
      titulo: new FormControl(this.nuevaTarea.titulo, [Validators.required]),
      descripcion: new FormControl(this.nuevaTarea.descripcion, [Validators.required]),
      selectedStudentsFromGroups: new FormControl([]),
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
      // If editing, pre-select students from the current group if they are part of the task
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
    this.selectedFile = event.target.files[0];
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if (this.form.valid) {
      // Frontend validation for at least one alumno
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
        // Add materialDeApoyo here if no file is selected
        ...(this.selectedFile ? {} : { materialDeApoyo: null }),
        alumnos: finalAlumnos,
        profesorId: profesorId
      };

      if (this.tarea && this.tarea._id) {
        taskData._id = this.tarea._id;
      }

      console.log('Debugging: taskData before FormData append:', taskData);
      console.log('Debugging: selectedFile before FormData append:', this.selectedFile);

      const formData = new FormData();
      formData.append('taskData', JSON.stringify(taskData));
      if (this.selectedFile) {
        formData.append('materialDeApoyo', this.selectedFile, this.selectedFile.name);
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });

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

