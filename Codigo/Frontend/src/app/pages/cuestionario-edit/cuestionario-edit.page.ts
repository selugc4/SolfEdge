import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Cuestionario } from '../../models/cuestionario.model';
import { Pregunta } from '../../models/pregunta.model';
import { Usuario } from '../../models/usuario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { GrupoService } from '../../services/grupo.service';
import { AuthService } from '../../services/auth.service';
import { CuestionarioStateService } from '../../services/cuestionario-state.service';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonListHeader, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput, IonTextarea, ToastController, IonRadioGroup, IonRadio, IonText } from "@ionic/angular/standalone";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  private domSanitizer: DomSanitizer = inject(DomSanitizer);
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
      recursoAudicion: [pregunta?.recursoAudicion || ''],
      archivoParaSubir: [null], // control para el archivo
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

    const pregunta = this.preguntas.at(preguntaIndex);
    pregunta.get('archivoParaSubir')?.setValue(file);
    // Clear the URL field to avoid confusion
    pregunta.get('recursoAudicion')?.setValue('');
    event.target.value = ''; // Allow re-selecting the same file if needed
    this.presentToast(`"${file.name}" listo para subir.`, 'success');
  }

  onRecursoAudicionUrlInput(event: any, preguntaIndex: number) {
    const url = event.detail.value;
    const pregunta = this.preguntas.at(preguntaIndex);
    pregunta.get('recursoAudicion')?.setValue(url, { emitEvent: false });
    // If user types a URL, clear any pending file upload
    if (url) {
      pregunta.get('archivoParaSubir')?.setValue(null);
    }
  }

  clearRecursoAudicion(preguntaIndex: number) {
    const pregunta = this.preguntas.at(preguntaIndex);
    pregunta.get('recursoAudicion')?.setValue('');
    pregunta.get('archivoParaSubir')?.setValue(null);
    this.presentToast('Recurso de audición eliminado localmente.', 'success');
  }

  // Helper to check if resource is Base64 audio
  isBase64Audio(resource: string | undefined): boolean {
    return resource ? resource.startsWith('data:audio/mpeg;base64,') : false;
  }

  // Helper to get safe URL for Base64 audio
  getSafeBase64Url(resource: string | undefined): SafeResourceUrl | null {
    return resource ? this.domSanitizer.bypassSecurityTrustResourceUrl(resource) : null;
  }

  // Helper to check if resource is a YouTube URL and extract video ID
  isYouTubeUrl(resource: string | undefined): string | null {
    if (!resource) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = resource.match(youtubeRegex);
    return match && match[1] ? match[1] : null;
  }

  // Helper to check if resource is a Spotify URL and extract ID
  isSpotifyUrl(resource: string | undefined): { type: string, id: string } | null {
    if (!resource) return null;
    const spotifyRegex = /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;
    const match = resource.match(spotifyRegex);
    return match && match[1] && match[2] ? { type: match[1], id: match[2] } : null;
  }

  // Helper to get safe YouTube embed URL
  getYouTubeEmbedUrl(videoId: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  // Helper to get safe Spotify embed URL
  getSpotifyEmbedUrl(type: string, id: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/${type}/${id}`);
  }

  goBack() {
    this.location.back();
  }

  private handleAudioUploads(cuestionarioId: string): Observable<any> {
    const formValue = this.form.getRawValue();
    const uploadObservables: Observable<{ recursoAudicion: string }>[] = [];

    formValue.preguntas.forEach((pregunta: any, index: number) => {
      if (pregunta.archivoParaSubir) {
        const file = pregunta.archivoParaSubir as File;
        uploadObservables.push(
          this.cuestionarioService.uploadAudioRecurso(cuestionarioId, index, file)
        );
      }
    });

    if (uploadObservables.length === 0) {
      return of(null); // No files to upload
    }

    return forkJoin(uploadObservables);
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
      return {
        texto: pregunta.texto,
        posiblesRespuestas: pregunta.posiblesRespuestas.map((respuesta: any, index: number) => ({
          texto: respuesta.texto,
          esCorrecta: index === correctIndex
        })),
        recursoAudicion: pregunta.recursoAudicion || ''
      };
    });

    const cuestionarioData: Partial<Cuestionario> = {
      nombre: formValue.nombre,
      alumnos: formValue.alumnos.map((a: any) => (a as any)._id || a),
      preguntas: transformedPreguntas,
      rama: this.rama!,
      fechaCierre: formValue.fechaCierre,
      profesor: currentUserId
    };

    const saveOperation: Observable<Cuestionario> = this.isEditMode
      ? this.cuestionarioService.updateCuestionario(this.cuestionarioId!, cuestionarioData)
      : this.cuestionarioService.crearCuestionario(cuestionarioData);

    saveOperation.pipe(
      switchMap(savedCuestionario => {
        const cuestionarioId = savedCuestionario._id;
        if (!cuestionarioId) {
          throw new Error('No se pudo obtener el ID del cuestionario guardado.');
        }
        return this.handleAudioUploads(cuestionarioId);
      })
    ).subscribe({
      next: () => {
        const message = this.isEditMode ? 'Cuestionario actualizado con éxito.' : 'Cuestionario creado con éxito.';
        this.presentToast(message, 'success');
        this.cuestionarioStateService.touch();
        this.goBack();
      },
      error: (err) => {
        const action = this.isEditMode ? 'actualizar' : 'crear';
        this.presentToast(`Error al ${action} el cuestionario: ${err.error?.message || err.message}`, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
