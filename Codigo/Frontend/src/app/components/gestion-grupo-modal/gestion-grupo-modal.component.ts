import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem} from '@ionic/angular/standalone';
import { Grupo } from 'src/app/models/grupo.model';
import { GrupoService } from 'src/app/services/grupo.service';

@Component({
  selector: 'app-gestion-grupo-modal',
  templateUrl: './gestion-grupo-modal.component.html',
  styleUrls: ['./gestion-grupo-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonListHeader, IonLabel, IonItem]
})
export class GestionGrupoModalComponent implements OnInit {
  @Input() selectedGrupo: Grupo | null = null;
  modalController: ModalController = inject(ModalController);
  grupoService: GrupoService = inject(GrupoService);
  toastController: ToastController = inject(ToastController);

  constructor() {}

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss();
  }

  deleteGrupo() {
    this.grupoService.deleteGrupo(this.selectedGrupo!._id).subscribe({
      next: () => {
        this.presentToast('Grupo eliminado correctamente.');
        this.modalController.dismiss(null, 'confirm');
      },
      error: (err) => this.presentToast(`Error al eliminar el grupo: ${err.error.error}`, 'danger')
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
