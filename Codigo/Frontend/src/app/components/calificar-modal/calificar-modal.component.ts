import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonLabel, IonItem, IonFooter, IonInput, ModalController, ToastController, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonIcon } from "@ionic/angular/standalone";
import { Calificacion } from 'src/app/models/calificacion.model';
import { TareaService } from 'src/app/services/tarea.service';

@Component({
  selector: 'app-calificar-modal',
  templateUrl: './calificar-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonContent, IonLabel, IonItem, IonFooter, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonIcon]
})
export class CalificarModalComponent implements OnInit {
  @Input() entrega!: Calificacion;
  form: FormGroup;

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private tareaService = inject(TareaService);

  constructor() {
    this.form = new FormGroup({
      nota: new FormControl(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(10),
        Validators.pattern(/^\d{1,2}([.,]\d{0,2})?$/)
      ]),
      observaciones: new FormControl('', [
        Validators.maxLength(200)
      ])
    });
  }
  ngOnInit() {
    if (this.entrega) {
      this.form.patchValue({
        nota: this.entrega.nota !== null ? this.entrega.nota : null,
        observaciones: this.entrega.observaciones ?? ''
      });
    }
  }
  limitLength(event: any) {
    let value = event.detail.value ?? '';

    value = value.toString().replace(',', '.');

    const regex = /^\d{0,2}(\.\d{0,2})?$/;

    if (!regex.test(value)) {
      value = value.slice(0, -1);
    }

    if (Number(value) > 10) {
      value = '10';
    }

    event.target.value = value;
    this.form.patchValue({ nota: value });
  }
    cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.invalid) {
      this.presentToast('Por favor, introduce una nota válida entre 0 y 10.', 'danger');
      return;
    }

    const { nota, observaciones } = this.form.value;

    const observacionesFinales = observaciones?.trim() || null;

    this.tareaService.calificarEntrega(
      this.entrega._id,
      nota,
      observacionesFinales
    ).subscribe({
      next: (calificacionActualizada) => {
        this.presentToast('Calificación guardada con éxito.', 'success');
        this.modalCtrl.dismiss(calificacionActualizada, 'confirm');
      },
      error: (err) => {
        this.presentToast(`Error al guardar la calificación: ${err.error.message || err.message}`, 'danger');
      }
    });
  }

  downloadArchivo() {
    if (!this.entrega.respuestaArchivo || !this.entrega.nombreArchivo) return;

    const byteCharacters = atob(this.entrega.respuestaArchivo);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: this.entrega.tipoArchivo });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.entrega.nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
