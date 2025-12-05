import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Cuestionario } from '../../models/cuestionario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonRadio, IonRadioGroup, IonFooter, ModalController, ToastController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-completar-cuestionario-modal',
  templateUrl: './completar-cuestionario-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonRadio, IonRadioGroup, IonFooter]
})
export class CompletarCuestionarioModalComponent implements OnInit {
  @Input() cuestionarioId!: string;
  cuestionario!: Cuestionario;
  form: FormGroup;

  private modalCtrl: ModalController = inject(ModalController);
  private toastCtrl: ToastController = inject(ToastController);
  private fb: FormBuilder = inject(FormBuilder);
  private cuestionarioService: CuestionarioService = inject(CuestionarioService);

  constructor() {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    if (this.cuestionarioId) {
      this.cuestionarioService.getCuestionarioById(this.cuestionarioId).subscribe(cuestionario => {
        this.cuestionario = cuestionario;
        // Create a form control for each question
        this.cuestionario.preguntas.forEach((pregunta, index) => {
          this.form.addControl(index.toString(), new FormControl('', Validators.required));
        });
      });
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.invalid) {
      this.presentToast('Por favor, responde a todas las preguntas.', 'danger');
      return;
    }

    // The form value is an object like { '0': 1, '1': 0, ... } where keys are question indices
    // and values are the selected answer's index.
    const respuestasArray = Object.keys(this.form.value)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(questionIndexStr => {
        const answerIndex = this.form.value[questionIndexStr];
        return answerIndex.toString();
      });

    this.cuestionarioService.entregarCuestionario(this.cuestionarioId, respuestasArray).subscribe({
      next: (calificacion) => {
        this.presentToast(`Cuestionario entregado. Tu nota es: ${calificacion.nota.toFixed(2)}`, 'success');
        this.modalCtrl.dismiss(calificacion, 'confirm');
      },
      error: (err) => {
        this.presentToast(`Error al entregar: ${err.error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 4000, color });
    toast.present();
  }
}
