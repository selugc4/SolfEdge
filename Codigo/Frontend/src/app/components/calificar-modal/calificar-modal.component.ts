import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonLabel, IonItem, IonFooter, IonInput, ModalController, ToastController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-calificar-modal',
  templateUrl: './calificar-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonLabel, IonItem, IonFooter, IonInput]
})
export class CalificarModalComponent implements OnInit {
  @Input() itemId: string = '';
  @Input() itemType: 'tarea' | 'cuestionario' = 'tarea';
  form: FormGroup;
  modalCtrl: ModalController = inject(ModalController);
  toastCtrl: ToastController = inject(ToastController);
  constructor(
  ) {
    this.form = new FormGroup({
      alumnoId: new FormControl('', [Validators.required]),
      nota: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10)])
    });
  }

  ngOnInit() { }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      return this.modalCtrl.dismiss(this.form.value, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos y asegúrate de que la nota sea entre 0 y 10.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
