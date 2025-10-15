import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RamaConfigService } from '../services/rama-config.service';
import { RamaConfig } from '../models/rama-config.model';
import { AuthService } from '../services/auth.service';
import { Tarea } from '../models/tarea.model';
import { TareaService } from '../services/tarea.service';
import { TareaModalComponent } from '../components/tarea-modal/tarea-modal.component';
import { Cuestionario } from '../models/cuestionario.model';
import { CuestionarioService } from '../services/cuestionario.service';
import { CuestionarioModalComponent } from '../components/cuestionario-modal/cuestionario-modal.component';
import { CalificarModalComponent } from '../components/calificar-modal/calificar-modal.component';
import { CalificarCuestionarioModalComponent } from '../components/calificar-cuestionario-modal/calificar-cuestionario-modal.component';
import { EntregarTareaModalComponent } from '../components/entregar-tarea-modal/entregar-tarea-modal.component';
import { CompletarCuestionarioModalComponent } from '../components/completar-cuestionario-modal/completar-cuestionario-modal.component';
import { AlertController, IonButtons, IonMenuButton, ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonList, IonLabel, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";
import { GrupoStateService } from '../services/grupo-state.service';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo.model';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonItem, IonList, IonLabel, IonFab, IonFabButton]
})
export class Tab4Page {
  ramaConfig: RamaConfig | undefined;
  tareas: Tarea[] = [];
  cuestionarios: Cuestionario[] = [];
  isProfessor = false;
  userId: string = '';
  readonly RAMA_NOMBRE = 'Teoría';
  useCuestionarios = false;
  ramaConfigService: RamaConfigService = inject(RamaConfigService);
  tareaService: TareaService = inject(TareaService);
  cuestionarioService: CuestionarioService = inject(CuestionarioService);
  authService: AuthService = inject(AuthService);
  toastController: ToastController = inject(ToastController);
  alertController: AlertController = inject(AlertController);
  modalController: ModalController = inject(ModalController);
  grupoStateService: GrupoStateService = inject(GrupoStateService);
  grupoService: GrupoService = inject(GrupoService);
  selectedGrupo: Grupo | null = null;

  ionViewWillEnter() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
        this.userId = user._id;
        this.grupoStateService.selectedGrupo$.subscribe(grupo => {
          this.selectedGrupo = grupo;
          if (grupo) {
            this.loadTareas();
            this.loadCuestionarios();
            this.loadRamaConfig(grupo._id);
          } else {
            this.tareas = [];
            this.cuestionarios = [];
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

  loadCuestionarios() {
    if (!this.userId) return;
    this.cuestionarioService.getCuestionariosByUsuarioAndRama(this.userId, this.RAMA_NOMBRE).subscribe(cuestionarios => {
      this.cuestionarios = cuestionarios;
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.ramaConfigService.uploadFile(file).subscribe({
        next: (response) => {
          this.ramaConfigService.updateRamaPdf(this.ramaConfig!._id, response.fileId).subscribe(() => {
            this.presentToast('Libro subido con éxito.');
            this.grupoStateService.selectedGrupo$.subscribe(grupo => {
              if (grupo) {
                this.loadRamaConfig(grupo._id);
              }
            });
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
            this.ramaConfigService.updateRamaPdf(this.ramaConfig!._id, null).subscribe(() => {
              this.presentToast('Libro eliminado.');
              this.grupoStateService.selectedGrupo$.subscribe(grupo => {
                if (grupo) {
                  this.loadRamaConfig(grupo._id);
                }
              });
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

  async deleteCuestionario(cuestionarioId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este cuestionario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.cuestionarioService.deleteCuestionario(cuestionarioId).subscribe(() => {
              this.presentToast('Cuestionario eliminado.');
              this.grupoStateService.selectedGrupo$.subscribe(grupo => {
                if (grupo) {
                  this.loadCuestionarios();
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
            profesor: this.userId
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

  async presentCuestionarioModal(cuestionario?: Cuestionario) {
    if (!this.userId) {
      this.presentToast('Error: ID de usuario no disponible.', 'danger');
      return;
    }

    this.grupoStateService.selectedGrupo$.subscribe(async (grupo) => {
      if (grupo) {
        const allAlumnos = grupo.alumnos;
        const uniqueAlumnos = [...new Map(allAlumnos.map(item => [item['_id'], item])).values()];

        const modal = await this.modalController.create({
          component: CuestionarioModalComponent,
          componentProps: {
            rama: this.RAMA_NOMBRE,
            cuestionario: cuestionario || null,
            alumnos: uniqueAlumnos,
            grupoId: grupo._id
          }
        });
        modal.present();

        const { data, role } = await modal.onWillDismiss();

        if (role === 'confirm') {
          const cuestionarioData: Partial<Cuestionario> = {
            nombre: data.nombre,
            preguntas: data.preguntas,
            rama: this.RAMA_NOMBRE,
            alumnos: data.alumnos,
            profesor: this.userId,
          };

          if (cuestionario) {
            // Lógica para actualizar cuestionario existente (requiere endpoint PATCH /cuestionarios/{id})
            this.presentToast('Funcionalidad pendiente: Actualizar cuestionario requiere un endpoint en el backend.', 'warning');
          } else {
            this.cuestionarioService.crearCuestionario(cuestionarioData).subscribe({
              next: () => {
                this.presentToast('Cuestionario creado con éxito.');
                this.loadCuestionarios();
              },
              error: (err) => {
                this.presentToast(`Error al crear cuestionario: ${err.error.message || err.message}`, 'danger');
              }
            });
          }
        }
      }
    });
  }

  async presentCalificarModal(itemId: string, itemType: 'tarea' | 'cuestionario') {
    if (!this.userId) {
      this.presentToast('Error: ID de profesor no disponible.', 'danger');
      return;
    }

    let modal;
    if (itemType === 'tarea') {
      modal = await this.modalController.create({
        component: CalificarModalComponent,
        componentProps: {
          itemId: itemId,
          itemType: itemType
        }
      });
    } else if (itemType === 'cuestionario') {
      modal = await this.modalController.create({
        component: CalificarCuestionarioModalComponent,
        componentProps: {
          cuestionarioId: itemId
        }
      });
    } else {
      return;
    }

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (itemType === 'tarea') {
        this.tareaService.calificarTarea(itemId, data.alumnoId, data.nota).subscribe({
          next: () => {
            this.presentToast('Calificación de tarea guardada con éxito.');
          },
          error: (err) => {
            this.presentToast(`Error al calificar tarea: ${err.error.message || err.message}`, 'danger');
          }
        });
      } else if (itemType === 'cuestionario') {
      }
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

  async presentCompletarCuestionarioModal(cuestionarioId: string) {
    const modal = await this.modalController.create({
      component: CompletarCuestionarioModalComponent,
      componentProps: {
        cuestionarioId: cuestionarioId
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (!this.userId) {
        this.presentToast('Error: ID de usuario no disponible.', 'danger');
        return;
      }
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
