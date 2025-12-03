import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonLabel, IonItem, IonFooter, IonInput, ModalController, ToastController, IonList, IonTextarea } from "@ionic/angular/standalone";
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-mensaje-modal',
  templateUrl: './mensaje-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonLabel, IonItem, IonFooter, IonInput, IonList, IonTextarea]
})
export class MensajeModalComponent implements OnInit {
  form: FormGroup;
  selectedAlumnos: Usuario[] = [];
  modalCtrl: ModalController = inject(ModalController);
  toastCtrl: ToastController = inject(ToastController);

  constructor() {
    this.form = new FormGroup({
      asunto: new FormControl('', [Validators.required]),
      texto: new FormControl('', [Validators.required]),
      alumnoIds: new FormControl([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit() { }

  async openSelectAlumnosModal() {
    const modal = await this.modalCtrl.create({
      component: SelectAlumnosModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.selectedAlumnos = data;
      this.form.controls['alumnoIds'].setValue(this.selectedAlumnos.map(a => a._id));
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      return this.modalCtrl.dismiss(this.form.value, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
