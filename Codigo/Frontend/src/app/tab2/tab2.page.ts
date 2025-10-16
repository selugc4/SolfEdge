import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RamaConfigService } from '../services/rama-config.service';
import { RamaConfig } from '../models/rama-config.model';
import { AuthService } from '../services/auth.service';
import { Tarea } from '../models/tarea.model';
import { TareaService } from '../services/tarea.service';
import { TareaModalComponent } from '../components/tarea-modal/tarea-modal.component';
import { CalificarModalComponent } from '../components/calificar-modal/calificar-modal.component';
import { EntregarTareaModalComponent } from '../components/entregar-tarea-modal/entregar-tarea-modal.component';
import { AlertController, IonButtons, IonMenuButton, ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";
import { GrupoStateService } from '../services/grupo-state.service';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton]
})
export class Tab2Page {
  ramaConfig: RamaConfig | undefined;
  tareas: Tarea[] = [];
  isProfessor = false;
  userId: string = '';
  readonly RAMA_NOMBRE = 'Entonación';
  selectedGrupo: Grupo | null = null;
  ramaConfigService: RamaConfigService = inject(RamaConfigService);
  tareaService: TareaService = inject(TareaService);
  authService: AuthService = inject(AuthService);
  toastController: ToastController = inject(ToastController);
  alertController: AlertController = inject(AlertController);
  modalController: ModalController = inject(ModalController);
  grupoStateService: GrupoStateService = inject(GrupoStateService);
  grupoService: GrupoService = inject(GrupoService);
  ionViewWillEnter() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
        this.userId = user._id;
        this.grupoStateService.selectedGrupo$.subscribe(grupo => {
          this.selectedGrupo = grupo;
          if (grupo) {
            this.loadTareas();
            this.loadRamaConfig(grupo._id);
          } else {
            this.tareas = [];
            this.ramaConfig = undefined;
          }
        });
      }
    });
  }

  loadRamaConfig(grupoId: string) {
    this.ramaConfigService.getAllRamas().subscribe(ramas => {
      this.ramaConfig = ramas.find(r => r.nombre === this.RAMA_NOMBRE && r.grupo === grupoId);
    });
  }

  loadTareas() {
    if (!this.userId) return;
    this.tareaService.getTareasByUsuarioAndRama(this.userId, this.RAMA_NOMBRE).subscribe(tareas => {
      this.tareas = tareas;
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.ramaConfigService.updateRamaPdf(this.ramaConfig!._id, file).subscribe({
        next: () => {
          this.presentToast('Libro subido con éxito.');
          this.grupoStateService.selectedGrupo$.subscribe(grupo => {
            if (grupo) {
              this.loadRamaConfig(grupo._id);
            }
          });
        },
        error: () => this.presentToast('Error al subir el archivo.', 'danger')
      });
    }
  }

  async eliminarLibro() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar el libro de apoyo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.ramaConfigService.updateRamaPdf(this.ramaConfig!._id, null).subscribe({
              next: () => {
                this.presentToast('Libro eliminado.');
                this.grupoStateService.selectedGrupo$.subscribe(grupo => {
                  if (grupo) {
                    this.loadRamaConfig(grupo._id);
                  }
                });
              },
              error: () => this.presentToast('Error al eliminar el libro.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTarea(tareaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.tareaService.deleteTarea(tareaId).subscribe(() => {
              this.presentToast('Tarea eliminada.');
              this.grupoStateService.selectedGrupo$.subscribe(grupo => {
                if (grupo) {
                  this.loadTareas();
                }
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentTareaModal(tarea?: Tarea) {
    if (!this.userId) {
      this.presentToast('Error: ID de usuario no disponible.', 'danger');
      return;
    }

    this.grupoStateService.selectedGrupo$.subscribe(async (grupo) => {
      if (grupo) {
        const allAlumnos = grupo.alumnos;
        const uniqueAlumnos = [...new Map(allAlumnos.map(item => [item['_id'], item])).values()];

        const modal = await this.modalController.create({
          component: TareaModalComponent,
          componentProps: {
            rama: this.RAMA_NOMBRE,
            tarea: tarea || null,
            alumnos: uniqueAlumnos,
            grupoId: grupo._id
          }
        });
        modal.present();

        const { data, role } = await modal.onWillDismiss();

        if (role === 'confirm') {
          const tareaData: Partial<Tarea> = {
            titulo: data.titulo,
            descripcion: data.descripcion,
            rama: this.RAMA_NOMBRE,
            materialDeApoyo: data.materialDeApoyo,
            alumnos: data.alumnos,
            profesor: this.userId,
          };

          if (tarea) {
            // Lógica para actualizar tarea existente (requiere endpoint PATCH /tareas/{id})
            this.presentToast('Funcionalidad pendiente: Actualizar tarea requiere un endpoint en el backend.', 'warning');
          } else {
            this.tareaService.crearTarea(tareaData).subscribe({
              next: () => {
                this.presentToast('Tarea creada con éxito.');
                this.loadTareas();
              },
              error: (err) => {
                this.presentToast(`Error al crear tarea: ${err.error.message || err.message}`, 'danger');
              }
            });
          }
        }
      }
    });
  }

  async presentCalificarModal(itemId: string, itemType: 'tarea' | 'cuestionario') {
    const modal = await this.modalController.create({
      component: CalificarModalComponent,
      componentProps: {
        itemId: itemId,
        itemType: itemType
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.tareaService.calificarTarea(itemId, data.alumnoId, data.nota).subscribe({
        next: () => {
          this.presentToast('Calificación de tarea guardada con éxito.');
        },
        error: (err) => {
          this.presentToast(`Error al calificar tarea: ${err.error.message || err.message}`, 'danger');
        }
      });
    }
  }

  async presentEntregarTareaModal(tareaId: string) {
    const modal = await this.modalController.create({
      component: EntregarTareaModalComponent,
      componentProps: {
        tareaId: tareaId
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // Lógica para enviar la entrega de la tarea al backend
      // Bloqueado: No hay un endpoint en el backend para la entrega de tareas por parte del alumno.
      this.presentToast('Funcionalidad pendiente: Entrega de tarea requiere un endpoint en el backend.', 'warning');
    }
  }

  async verLibro() {
    if (this.ramaConfig?.libroDeApoyo) {
      const pdfUrl = `${this.ramaConfigService.getDownloadUrl(this.ramaConfig.libroDeApoyo)}`;
      window.open(pdfUrl, '_blank');
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
