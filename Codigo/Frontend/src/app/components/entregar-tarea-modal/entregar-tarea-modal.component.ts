import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonItem, IonLabel, IonFooter, IonTextarea, ModalController, ToastController, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, attachOutline } from 'ionicons/icons';

@Component({
  selector: 'app-entregar-tarea-modal',
  templateUrl: './entregar-tarea-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonItem, IonLabel, IonFooter, IonTextarea, IonIcon]
})
export class EntregarTareaModalComponent implements OnInit {
  @Input() tareaId!: string;
  form: FormGroup;
  selectedFile: File | null = null;

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private tareaService = inject(TareaService);

  constructor() {
    this.form = new FormGroup({
      respuestaTexto: new FormControl(''),
    });
    addIcons({ attachOutline });
  }

  ngOnInit() { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (!this.form.value.respuestaTexto && !this.selectedFile) {
      this.presentToast('Debes añadir un texto o un archivo para entregar.', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('respuestaTexto', this.form.value.respuestaTexto);
    if (this.selectedFile) {
      formData.append('respuestaArchivo', this.selectedFile, this.selectedFile.name);
    }

    this.tareaService.entregarTarea(this.tareaId, formData).subscribe({
      next: (entrega) => {
        this.presentToast('Tarea entregada con éxito.', 'success');
        this.modalCtrl.dismiss(entrega, 'confirm');
      },
      error: (err) => {
        this.presentToast(`Error al entregar la tarea: ${err.error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color });
    toast.present();
  }
}
