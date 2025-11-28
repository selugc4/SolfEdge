import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Cuestionario } from '../../models/cuestionario.model';
import { Pregunta } from '../../models/pregunta.model';
import { Usuario } from '../../models/usuario.model';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonListHeader, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter, IonInput, IonTextarea, ModalController, ToastController, IonRadioGroup, IonRadio } from "@ionic/angular/standalone";

@Component({
  selector: 'app-cuestionario-modal',
  templateUrl: './cuestionario-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonListHeader, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter, IonInput, IonTextarea, IonRadioGroup, IonRadio]
})
export class CuestionarioModalComponent implements OnInit {
  @Input() cuestionario: Cuestionario | null = null;
  @Input() rama!: string;
  @Input() alumnos: Usuario[] = [];

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private fb = inject(FormBuilder);
  form: FormGroup;
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
  }

  ngOnInit() {
    if (this.cuestionario) {
      this.form.patchValue({
        nombre: this.cuestionario.nombre,
        alumnos: this.cuestionario.alumnos
      });
      if (this.cuestionario.fechaCierre) {
        const fechaCierre = new Date(this.cuestionario.fechaCierre);
        this.form.patchValue({ fechaCierre: fechaCierre.toISOString().split('T')[0] });
      }
      this.cuestionario.preguntas.forEach(pregunta => {
        this.addPregunta(pregunta);
      });
    } else {
      this.addPregunta(); // Add one initial question
    }
  }

  get preguntas() {
    return this.form.get('preguntas') as FormArray;
  }

  addPregunta(pregunta?: Pregunta) {
    const respuestas = pregunta?.posiblesRespuestas || [{ texto: '', esCorrecta: true }, { texto: '', esCorrecta: false }];
    const respuestaCorrectaIndex = respuestas.findIndex(r => r.esCorrecta);

    const preguntaGroup = this.fb.group({
      texto: [pregunta?.texto || '', Validators.required],
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
    }
    else {
      this.presentToast('No se pueden añadir más de 4 respuestas.', 'warning');
    }
  }

  removeRespuesta(preguntaIndex: number, respuestaIndex: number) {
    const respuestasArray = this.getPosiblesRespuestas(preguntaIndex);
    if (respuestasArray.length > 2) {
      respuestasArray.removeAt(respuestaIndex);
      // Si se elimina la respuesta correcta, se marca la primera como correcta
      const preguntaGroup = this.preguntas.at(preguntaIndex);
      if (preguntaGroup.get('respuestaCorrecta')?.value === respuestaIndex.toString()) {
        preguntaGroup.get('respuestaCorrecta')?.setValue('0');
      }
    }
    else {
      this.presentToast('Debe haber al menos 2 respuestas.', 'warning');
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.invalid) {
      this.presentToast('Por favor, completa todos los campos requeridos.', 'danger');
      return;
    }

    const formValue = this.form.getRawValue();

    const transformedPreguntas = formValue.preguntas.map((pregunta: any) => {
      const correctIndex = parseInt(pregunta.respuestaCorrecta, 10);
      const transformedRespuestas = pregunta.posiblesRespuestas.map((respuesta: any, index: number) => {
        return {
          texto: respuesta.texto,
          esCorrecta: index === correctIndex
        };
      });
      return {
        texto: pregunta.texto,
        posiblesRespuestas: transformedRespuestas
      };
    });

    const finalCuestionario = {
      nombre: formValue.nombre,
      alumnos: formValue.alumnos,
      preguntas: transformedPreguntas,
      rama: this.rama,
      fechaCierre: formValue.fechaCierre
    };

    return this.modalCtrl.dismiss(finalCuestionario, 'confirm');
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
