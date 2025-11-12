import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { RamaConfigService } from '../../services/rama-config.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonItem, IonLabel, IonFooter } from "@ionic/angular/standalone";

@Component({
  selector: 'app-entregar-tarea-modal',
  templateUrl: './entregar-tarea-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonItem, IonLabel, IonFooter]
})
export class EntregarTareaModalComponent implements OnInit {
  @Input() tareaId: string = '';
  form: FormGroup;
  selectedFile: File | null = null;
  materialEntregadoId: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private ramaConfigService: RamaConfigService
  ) {
    this.form = new FormGroup({
      comentario: new FormControl(''),
      // materialEntregado se gestionará por separado
    });
  }

  ngOnInit() { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadMaterial() {
    if (this.selectedFile) {
      try {
        this.presentToast('Material entregado subido con éxito.', 'success');
      } catch (error) {
        this.presentToast('Error al subir el material entregado.', 'danger');
        this.materialEntregadoId = null;
      }
    } else {
      this.presentToast('Selecciona un archivo primero.');
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if (this.form.valid) {
      if (this.selectedFile && !this.materialEntregadoId) {
        await this.uploadMaterial();
        if (!this.materialEntregadoId) {
          this.presentToast('Error al subir el material. Inténtalo de nuevo.', 'danger');
          return;
        }
      }
      const result = { ...this.form.value, materialEntregado: this.materialEntregadoId };
      return this.modalCtrl.dismiss(result, 'confirm');
    }
    this.presentToast('Por favor, completa el comentario o sube un archivo.');
    return;
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
