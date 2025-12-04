import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Cuestionario } from '../../models/cuestionario.model';
import { Pregunta } from '../../models/pregunta.model';
import { Usuario } from '../../models/usuario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { GrupoService } from '../../services/grupo.service';
import { AuthService } from '../../services/auth.service';
import { CuestionarioStateService } from '../../services/cuestionario-state.service';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonListHeader, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, ToastController, IonRadioGroup, IonRadio, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline, musicalNotesOutline, closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cuestionario-edit',
  templateUrl: './cuestionario-edit.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonListHeader, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, IonRadioGroup, IonRadio, IonText]
})
export class CuestionarioEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private cuestionarioService = inject(CuestionarioService);
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private cuestionarioStateService = inject(CuestionarioStateService);
  form: FormGroup;
  isEditMode = false;
  cuestionarioId: string | null = null;
  rama: string | null = null;
  grupoId: string | null = null;
  alumnos: Partial<Usuario>[] = [];
  pageTitle = 'Crear Cuestionario';
  minDate: string;
  private today = new Date();

  constructor() {
    this.today.setDate(this.today.getDate() + 1);
    this.minDate = this.today.toISOString().split('T')[0];
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      alumnos: [[], [Validators.required, Validators.minLength(1)]],
      preguntas: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      fechaCierre: [null]
    });
    addIcons({ addCircleOutline, trashOutline, musicalNotesOutline, closeCircleOutline }); // Added musicalNotesOutline, closeCircleOutline
  }

  ngOnInit() {
    this.cuestionarioId = this.route.snapshot.paramMap.get('id');
    this.rama = this.route.snapshot.queryParamMap.get('rama');
    this.grupoId = this.route.snapshot.queryParamMap.get('grupoId');
    this.isEditMode = !!this.cuestionarioId;

    if (!this.grupoId || !this.rama) {
        this.presentToast('Falta información de la rama o el grupo.', 'danger');
        this.location.back();
        return;
    }

    this.grupoService.getGrupoById(this.grupoId!).subscribe(grupo => {
        this.alumnos = grupo.alumnos;
        if (this.isEditMode) {
            this.pageTitle = 'Editar Cuestionario';
            this.cuestionarioService.getCuestionarioById(this.cuestionarioId!).subscribe(cuestionario => {
                this.setupForm(cuestionario);
            });
        } else {
            this.pageTitle = 'Crear Cuestionario';
            this.form.get('alumnos')?.setValue(this.alumnos.map(a => a._id));
            this.addPregunta();
        }
    });
  }

  setupForm(cuestionario: Cuestionario) {
      this.form.patchValue({
        nombre: cuestionario.nombre,
        alumnos: cuestionario.alumnos.map(a => (a as any)._id || a) // Handle partial User object or just ID
      });
      if (cuestionario.fechaCierre) {
        const fechaCierre = new Date(cuestionario.fechaCierre);
        // Only set if fechaCierre is a valid date object. The API returns it as Date object.
        if (!isNaN(fechaCierre.getTime())) {
          this.form.patchValue({ fechaCierre: fechaCierre.toISOString().split('T')[0] });
        }
      }
      cuestionario.preguntas.forEach(pregunta => {
        this.addPregunta(pregunta);
      });
  }

  get preguntas() {
    return this.form.get('preguntas') as FormArray;
  }

  addPregunta(pregunta?: Pregunta) {
    const respuestas = pregunta?.posiblesRespuestas || [{ texto: '', esCorrecta: true }, { texto: '', esCorrecta: false }];
    const respuestaCorrectaIndex = respuestas.findIndex(r => r.esCorrecta);

    const preguntaGroup = this.fb.group({
      texto: [pregunta?.texto || '', Validators.required],
      recursoAudicion: [pregunta?.recursoAudicion || ''], // Added new form control
      respuestaCorrecta: [respuestaCorrectaIndex !== -1 ? respuestaCorrectaIndex.toString() : '0', Validators.required],
      posiblesRespuestas: this.fb.array(
        respuestas.map(r => this.fb.group({ texto: [r.texto, Validators.required] })),
        [Validators.required, Validators.minLength(2), Validators.maxLength(4)]
      )
    });
    this.preguntas.push(preguntaGroup);
  }

  removePregunta(index: number) {
    this.preguntas.removeAt(index);
  }

  getPosiblesRespuestas(preguntaIndex: number) {
    return this.preguntas.at(preguntaIndex).get('posiblesRespuestas') as FormArray;
  }

  addRespuesta(preguntaIndex: number) {
    const respuestasArray = this.getPosiblesRespuestas(preguntaIndex);
    if (respuestasArray.length < 4) {
      respuestasArray.push(this.fb.group({ texto: ['', Validators.required] }));
    } else {
      this.presentToast('No se pueden añadir más de 4 respuestas.', 'warning');
    }
  }

  removeRespuesta(preguntaIndex: number, respuestaIndex: number) {
    const respuestasArray = this.getPosiblesRespuestas(preguntaIndex);
    if (respuestasArray.length > 2) {
      respuestasArray.removeAt(respuestaIndex);
      const preguntaGroup = this.preguntas.at(preguntaIndex);
      if (preguntaGroup.get('respuestaCorrecta')?.value === respuestaIndex.toString()) {
        preguntaGroup.get('respuestaCorrecta')?.setValue('0');
      }
    } else {
      this.presentToast('Debe haber al menos 2 respuestas.', 'warning');
    }
  }

  onFileSelected(event: any, preguntaIndex: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.type !== 'audio/mpeg') {
      this.presentToast('Solo se permiten archivos MP3.', 'danger');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // Max 5MB
      this.presentToast('El archivo de audio no puede exceder los 5MB.', 'danger');
      return;
    }

    if (!this.cuestionarioId) {
      this.presentToast('Guarda el cuestionario primero para poder subir archivos de audio.', 'danger');
      event.target.value = ''; // Clear file input
      return;
    }

    this.cuestionarioService.uploadAudioRecurso(this.cuestionarioId, preguntaIndex, file).subscribe({
      next: (response) => {
        this.preguntas.at(preguntaIndex).get('recursoAudicion')?.setValue(response.recursoAudicion);
        this.presentToast('Archivo de audio subido con éxito.', 'success');
      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.presentToast(`Error al subir el archivo de audio: ${err.error?.message || err.message}`, 'danger');
      }
    });
  }

  onRecursoAudicionUrlInput(event: any, preguntaIndex: number) {
    const url = event.detail.value;
    const currentRecursoAudicion = this.preguntas.at(preguntaIndex).get('recursoAudicion')?.value;

    if (currentRecursoAudicion === url) return; // No change, do nothing

    if (!this.cuestionarioId) {
      this.preguntas.at(preguntaIndex).get('recursoAudicion')?.setValue(url);
      return;
    }

    // If questionnaire exists, update via service
    this.cuestionarioService.updateAudioRecursoUrl(this.cuestionarioId, preguntaIndex, url).subscribe({
      next: (response) => {
        this.preguntas.at(preguntaIndex).get('recursoAudicion')?.setValue(response.recursoAudicion);
        this.presentToast('URL de recurso de audición actualizada con éxito.', 'success');
      },
      error: (err) => {
        console.error('Error al actualizar URL:', err);
        this.presentToast(`Error al actualizar URL del recurso: ${err.error?.message || err.message}`, 'danger');
      }
    });
  }

  clearRecursoAudicion(preguntaIndex: number) {
    if (!this.cuestionarioId) {
      this.preguntas.at(preguntaIndex).get('recursoAudicion')?.setValue('');
      this.presentToast('Recurso de audición eliminado localmente.', 'success');
      return;
    }

    this.cuestionarioService.clearAudioRecurso(this.cuestionarioId, preguntaIndex).subscribe({
      next: () => {
        this.preguntas.at(preguntaIndex).get('recursoAudicion')?.setValue('');
        this.presentToast('Recurso de audición eliminado del cuestionario.', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar recurso:', err);
        this.presentToast(`Error al eliminar recurso de audición: ${err.error?.message || err.message}`, 'danger');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.presentToast('Por favor, completa todos los campos requeridos.', 'danger');
      return;
    }

    const formValue = this.form.getRawValue();
    const currentUserId = this.authService.currentUserValue?._id;
    if (!currentUserId) {
        this.presentToast('Error de autenticación.', 'danger');
        return;
    }

    const transformedPreguntas = formValue.preguntas.map((pregunta: any) => {
      const correctIndex = parseInt(pregunta.respuestaCorrecta, 10);
      const transformedRespuestas = pregunta.posiblesRespuestas.map((respuesta: any, index: number) => ({
        texto: respuesta.texto,
        esCorrecta: index === correctIndex
      }));
      
      const preguntaToSend: Partial<Pregunta> = {
        texto: pregunta.texto,
        posiblesRespuestas: transformedRespuestas
      };

      // Only include recursoAudicion if it's a new questionnaire (URLs only)
      // or if it's a URL in edit mode. Base64 is handled out-of-band by dedicated upload.
      if (!this.isEditMode || (pregunta.recursoAudicion && !pregunta.recursoAudicion.startsWith('data:audio/mpeg;base64,'))) {
        preguntaToSend.recursoAudicion = pregunta.recursoAudicion;
      }
      return preguntaToSend;
    });

    const cuestionarioData: Partial<Cuestionario> = {
      nombre: formValue.nombre,
      alumnos: formValue.alumnos.map((a: any) => (a as any)._id || a), // Ensure only IDs are sent
      preguntas: transformedPreguntas,
      rama: 'Teoria',
      fechaCierre: formValue.fechaCierre,
      profesor: currentUserId
    };

    if (this.isEditMode) {
      this.cuestionarioService.updateCuestionario(this.cuestionarioId!, cuestionarioData).subscribe({
        next: () => {
          this.presentToast('Cuestionario actualizado con éxito.', 'success');
          this.cuestionarioStateService.touch(); // Call touch()
          this.goBack();
        },
        error: (err) => this.presentToast(`Error al actualizar: ${err.error.message}`, 'danger')
      });
    } else {
      this.cuestionarioService.crearCuestionario(cuestionarioData).subscribe({
        next: () => {
          this.presentToast('Cuestionario creado con éxito.', 'success');
          this.cuestionarioStateService.touch(); // Call touch()
          this.goBack();
        },
        error: (err) => this.presentToast(`Error al crear: ${err.error.message}`, 'danger')
      });
    }
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
