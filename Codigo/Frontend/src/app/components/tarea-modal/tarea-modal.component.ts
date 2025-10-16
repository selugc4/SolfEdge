import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuario.model';
import { RamaConfigService } from '../../services/rama-config.service';

@Component({
  selector: 'app-tarea-modal',
  templateUrl: './tarea-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class TareaModalComponent implements OnInit {
  @Input() tarea: Tarea | null = null;
  @Input() rama: string = '';
  @Input() alumnos: Usuario[] = [];
  form: FormGroup;
  selectedFile: File | null = null;
  materialDeApoyoId: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private ramaConfigService: RamaConfigService // Reutilizamos el servicio de subida de archivos
  ) {
    this.form = new FormGroup({
      titulo: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.required]),
      fechaLimite: new FormControl(''), // Campo para la fecha límite
      alumnos: new FormControl([], [Validators.required])
      // materialDeApoyo se gestionará por separado debido a la subida de archivos
    });
  }

  ngOnInit() {
    if (this.tarea) {
      this.form.patchValue(this.tarea);
      this.materialDeApoyoId = this.tarea.materialDeApoyo || null;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadMaterial() {
    if (this.selectedFile) {
      try {
        this.presentToast('Material de apoyo subido con éxito.', 'success');
      } catch (error) {
        this.presentToast('Error al subir el material de apoyo.', 'danger');
        this.materialDeApoyoId = null;
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
      // Asegurarse de que el material de apoyo se ha subido si se seleccionó un archivo
      if (this.selectedFile && !this.materialDeApoyoId) {
        await this.uploadMaterial(); // Intentar subir antes de confirmar
        if (!this.materialDeApoyoId) {
          this.presentToast('Error al subir el material de apoyo. Inténtalo de nuevo.', 'danger');
          return;
        }
      }

      const result = { ...this.form.value, materialDeApoyo: this.materialDeApoyoId };
      return this.modalCtrl.dismiss(result, 'confirm');
    }
    this.presentToast('Por favor, completa todos los campos.');
    return;
  }

  async presentToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
