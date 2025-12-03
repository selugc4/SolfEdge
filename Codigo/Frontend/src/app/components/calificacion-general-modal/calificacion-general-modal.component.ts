import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, IonLabel, IonContent, IonItem, IonFooter, IonInput, ModalController, ToastController} from "@ionic/angular/standalone";
import { SelectAlumnosModalComponent } from '../select-alumnos-modal/select-alumnos-modal.component';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-calificacion-general-modal',
  templateUrl: './calificacion-general-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, IonLabel, IonContent, IonItem, IonFooter, IonInput]
})
export class CalificacionGeneralModalComponent implements OnInit {
  form: FormGroup;
  selectedAlumno: Usuario | null = null;
  private modalController: ModalController = inject(ModalController);
  private toastController: ToastController = inject(ToastController);

  constructor() {
    this.form = new FormGroup({
      alumnoId: new FormControl('', [Validators.required]),
      nota: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10)])
    });
  }

  ngOnInit() { }

  async openSelectAlumnosModal() {
    const modal = await this.modalController.create({
      component: SelectAlumnosModalComponent,
      componentProps: {
        multiple: false
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.selectedAlumno = data;
      this.form.controls['alumnoId'].setValue(this.selectedAlumno?._id);
    }
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      return this.modalController.dismiss(this.form.value, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos y asegúrate de que la nota sea entre 0 y 10.');
    return;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color: 'warning' });
    toast.present();
  }
}
