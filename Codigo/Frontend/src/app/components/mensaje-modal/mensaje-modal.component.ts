import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-mensaje-modal',
  templateUrl: './mensaje-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class MensajeModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.form = new FormGroup({
      asunto: new FormControl('', [Validators.required]),
      texto: new FormControl('', [Validators.required]),
      alumnoIds: new FormControl('', [Validators.required]) // IDs separados por coma
    });
  }

  ngOnInit() { }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      const alumnoIdsArray = this.form.value.alumnoIds.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);
      if (alumnoIdsArray.length === 0) {
        this.presentToast('Debes introducir al menos un ID de alumno.');
        return;
      }
      return this.modalCtrl.dismiss({ ...this.form.value, alumnoIds: alumnoIdsArray }, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
