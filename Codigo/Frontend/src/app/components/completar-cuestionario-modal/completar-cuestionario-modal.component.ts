import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Cuestionario } from '../../models/cuestionario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonRadio, IonFooter } from "@ionic/angular/standalone";

@Component({
  selector: 'app-completar-cuestionario-modal',
  templateUrl: './completar-cuestionario-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonRadio, IonFooter]
})
export class CompletarCuestionarioModalComponent implements OnInit {
  @Input() cuestionarioId: string = '';
  cuestionario!: Cuestionario;
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private cuestionarioService: CuestionarioService
  ) {
    this.form = this.fb.group({
      respuestas: this.fb.array([])
    });
  }

  ngOnInit() {
    if (this.cuestionarioId) {
      this.cuestionarioService.getCuestionarioById(this.cuestionarioId).subscribe(cuestionario => {
        this.cuestionario = cuestionario;
        this.cuestionario.preguntas.forEach(() => {
          this.respuestas.push(new FormControl('', Validators.required));
        });
      });
    }
  }

  get respuestas() {
    return this.form.get('respuestas') as FormArray;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      const respuestas = this.cuestionario.preguntas.map((pregunta, index) => {
        return this.form.value.respuestas[index];
      });
      return this.modalCtrl.dismiss(respuestas, 'confirm');
    }
    this.presentToast('Por favor, responde a todas las preguntas.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
