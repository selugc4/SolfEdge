import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonTextarea, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonItem, IonLabel, IonFooter, IonInput, ModalController, ToastController} from "@ionic/angular/standalone";
import { IonText } from '@ionic/angular';

@Component({
  selector: 'app-calificar-cuestionario-modal',
  templateUrl: './calificar-cuestionario-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonItem, IonLabel, IonFooter, IonInput, IonTextarea]
})
export class CalificarCuestionarioModalComponent implements OnInit {
  @Input() cuestionarioId: string = '';
  form: FormGroup;
  modalCtrl: ModalController = inject(ModalController);
  toastCtrl: ToastController = inject(ToastController);
  constructor(
  ) {
    this.form = new FormGroup({
      alumnoId: new FormControl('', [Validators.required]),
      respuestas: new FormControl('', [Validators.required]) // Respuestas separadas por coma
    });
  }

  ngOnInit() { }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      const respuestasArray = this.form.value.respuestas.split(',').map((res: string) => res.trim()).filter((res: string) => res.length > 0);
      if (respuestasArray.length === 0) {
        this.presentToast('Debes introducir al menos una respuesta.');
        return;
      }
      return this.modalCtrl.dismiss({ ...this.form.value, respuestas: respuestasArray }, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
