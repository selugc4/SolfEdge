import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Cuestionario } from '../../models/cuestionario.model';
import { Usuario } from '../../models/usuario.model';
import { RamaConfigService } from '../../services/rama-config.service';

@Component({
  selector: 'app-cuestionario-modal',
  templateUrl: './cuestionario-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CuestionarioModalComponent implements OnInit {
  @Input() cuestionario: Cuestionario | null = null;
  @Input() rama: string = 'Teoría';
  @Input() alumnos: Usuario[] = [];
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private ramaConfigService: RamaConfigService
  ) {
    this.form = this.fb.group({
      nombre: new FormControl('', [Validators.required]),
      preguntas: this.fb.array([], Validators.required),
      alumnos: new FormControl([], [Validators.required])
    });
  }

  ngOnInit() {
    if (this.cuestionario) {
      this.form.patchValue(this.cuestionario);
      this.cuestionario.preguntas.forEach(pregunta => {
        this.addPregunta(pregunta.texto, pregunta.posiblesRespuestas);
      });
    } else {
      this.addPregunta(); // Añadir una pregunta inicial para nuevos cuestionarios
    }
  }

  get preguntas() {
    return this.form.get('preguntas') as FormArray;
  }

  addPregunta(texto: string = '', posiblesRespuestas: string[] = ['', ''], audioMaterial: string | null = null) {
    const preguntaGroup = this.fb.group({
      texto: new FormControl(texto, Validators.required),
      posiblesRespuestas: this.fb.array(posiblesRespuestas.map(res => new FormControl(res, Validators.required)), Validators.minLength(2)),
      audioMaterial: new FormControl(audioMaterial) // Nuevo campo para el audio
    });
    this.preguntas.push(preguntaGroup);
  }

  removePregunta(index: number) {
    this.preguntas.removeAt(index);
  }

  getPosiblesRespuestas(preguntaIndex: number) {
    return this.preguntas.at(preguntaIndex).get('posiblesRespuestas') as FormArray;
  }

  addRespuesta(preguntaIndex: number, respuesta: string = '') {
    this.getPosiblesRespuestas(preguntaIndex).push(new FormControl(respuesta, Validators.required));
  }

  removeRespuesta(preguntaIndex: number, respuestaIndex: number) {
    this.getPosiblesRespuestas(preguntaIndex).removeAt(respuestaIndex);
  }

  async onAudioFileSelected(event: any, preguntaIndex: number) {
    const file: File = event.target.files[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/mp3')) {
      try {
        const response = await this.ramaConfigService.uploadFile(file).toPromise();
        this.preguntas.at(preguntaIndex).get('audioMaterial')?.setValue(response?.fileId || null);
        this.presentToast('Audio subido con éxito.', 'success');
      } catch (error) {
        this.presentToast('Error al subir el audio.', 'danger');
        this.preguntas.at(preguntaIndex).get('audioMaterial')?.setValue(null);
      }
    } else {
      this.presentToast('Selecciona un archivo MP3 válido.');
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      return this.modalCtrl.dismiss(this.form.value, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos y asegúrate de que cada pregunta tenga al menos 2 respuestas.');
    return;
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
