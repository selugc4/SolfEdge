import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-calificacion-general-modal',
  templateUrl: './calificacion-general-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CalificacionGeneralModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
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
