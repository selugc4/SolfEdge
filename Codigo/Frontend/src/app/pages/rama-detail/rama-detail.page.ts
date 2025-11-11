import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, IonButtons, IonMenuButton, ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cloudUploadOutline, createOutline, documentTextOutline, ribbonOutline, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { RamaConfigService } from '../../services/rama-config.service';
import { TareaService } from '../../services/tarea.service';
import { CuestionarioService } from '../../services/cuestionario.service';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';

import { RamaConfig } from '../../models/rama-config.model';
import { Tarea } from '../../models/tarea.model';
import { Cuestionario } from '../../models/cuestionario.model';
import { Grupo } from '../../models/grupo.model';

import { TareaModalComponent } from '../../components/tarea-modal/tarea-modal.component';
import { CuestionarioModalComponent } from '../../components/cuestionario-modal/cuestionario-modal.component';
import { CalificarModalComponent } from '../../components/calificar-modal/calificar-modal.component';
import { CalificarCuestionarioModalComponent } from '../../components/calificar-cuestionario-modal/calificar-cuestionario-modal.component';
import { EntregarTareaModalComponent } from '../../components/entregar-tarea-modal/entregar-tarea-modal.component';
import { CompletarCuestionarioModalComponent } from '../../components/completar-cuestionario-modal/completar-cuestionario-modal.component';

@Component({
  selector: 'app-rama-detail',
  templateUrl: './rama-detail.page.html',
  styleUrls: ['./rama-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton, RouterModule, IonToggle]
})
export class RamaDetailPage {
  title: string = '';
  readonly RAMA_NOMBRE = 'Teoría';
  ramaNombre: string = '';
  isTeoria: boolean = false;
  ramaConfig: RamaConfig | undefined;
  tareas: Tarea[] = [];
  cuestionarios: Cuestionario[] = [];
  isProfessor = false;
  userId: string = '';
  selectedGrupo: Grupo | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  hasLibroDeApoyo = false;
  useCuestionarios = false;

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly ramaConfigService: RamaConfigService = inject(RamaConfigService);
  private readonly tareaService: TareaService = inject(TareaService);
  private readonly cuestionarioService: CuestionarioService = inject(CuestionarioService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastController: ToastController = inject(ToastController);
  private readonly alertController: AlertController = inject(AlertController);
  private readonly modalController: ModalController = inject(ModalController);
  private readonly grupoStateService: GrupoStateService = inject(GrupoStateService);
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor() {
    addIcons({
      add,
      cloudUploadOutline,
      createOutline,
      documentTextOutline,
      ribbonOutline,
      trashOutline,
      checkmarkCircleOutline
    });
  }

  ionViewWillEnter() {
    this.route.data.subscribe(data => {
      this.title = data['title'];
      this.ramaNombre = data['ramaNombre'];
      this.isTeoria = this.ramaNombre === 'Teoría';
    });

    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
        this.userId = user._id;
        this.grupoStateService.selectedGrupo$.subscribe(grupo => {
          this.selectedGrupo = grupo;
          if (grupo) {
            this.loadTareas();
            this.loadRamaConfig(grupo._id);
            if (this.isTeoria) {
              this.loadCuestionarios();
            }
          } else {
            this.tareas = [];
            this.cuestionarios = [];
            this.ramaConfig = undefined;
            this.pdfUrl = null;
            this.hasLibroDeApoyo = false;
          }
        });
      }
    });
  }

  loadRamaConfig(grupoId: string) {
    this.ramaConfigService.getAllRamas().subscribe(ramas => {
      this.ramaConfig = ramas.find(r => r.nombre === this.ramaNombre && r.grupo === grupoId);
      if (this.ramaConfig) {
        this.ramaConfigService.getRamaPdf(this.ramaConfig._id).subscribe({
          next: (pdfBlob) => {
            const url = URL.createObjectURL(pdfBlob);
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.hasLibroDeApoyo = true;
          },
          error: () => {
            this.pdfUrl = null;
            this.hasLibroDeApoyo = false;
          }
        });
      } else {
        this.pdfUrl = null;
        this.hasLibroDeApoyo = false;
      }
    });
  }

  loadTareas() {
    if (!this.userId) return;
    this.tareaService.getTareasByUsuarioAndRama(this.userId, this.ramaNombre).subscribe(tareas => {
      this.tareas = tareas;
    });
  }

  loadCuestionarios() {
    if (!this.userId) return;
    this.cuestionarioService.getCuestionariosByUsuarioAndRama(this.userId, this.ramaNombre).subscribe(cuestionarios => {
      this.cuestionarios = cuestionarios;
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf' && this.ramaConfig) {
      this.ramaConfigService.updateRamaPdf(this.ramaConfig._id, file).subscribe({
        next: () => {
          this.presentToast('Libro subido con éxito.');
          if (this.selectedGrupo) {
            this.loadRamaConfig(this.selectedGrupo._id);
          }
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
            if (this.ramaConfig) {
              this.ramaConfigService.updateRamaPdf(this.ramaConfig._id, null).subscribe({
                next: () => {
                  this.presentToast('Libro eliminado.');
                  this.pdfUrl = null;
                  this.hasLibroDeApoyo = false;
                },
                error: () => this.presentToast('Error al eliminar el libro.', 'danger')
              });
            }
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
              this.loadTareas();
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
              this.loadCuestionarios();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentTareaModal(tarea?: Tarea) {
    if (!this.userId || !this.selectedGrupo) {
      this.presentToast('Error: ID de usuario o grupo no disponible.', 'danger');
      return;
    }

    const allAlumnos = this.selectedGrupo.alumnos;
    const uniqueAlumnos = [...new Map(allAlumnos.map(item => [item['_id'], item])).values()];

    const modal = await this.modalController.create({
      component: TareaModalComponent,
      componentProps: {
        rama: this.ramaNombre,
        tarea: tarea || null,
        alumnos: uniqueAlumnos,
        currentGroup: this.selectedGrupo
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const { taskData, selectedFile } = data;

      const formData = new FormData();
      formData.append('taskData', taskData);
      if (selectedFile) {
        formData.append('materialDeApoyo', selectedFile, selectedFile.name);
      }

      if (tarea) {
        this.presentToast('Funcionalidad pendiente: Actualizar tarea requiere un endpoint en el backend.', 'warning');
      } else {
        this.tareaService.crearTarea(formData).subscribe({
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

  async presentCuestionarioModal(cuestionario?: Cuestionario) {
    if (!this.userId || !this.selectedGrupo) {
      this.presentToast('Error: ID de usuario o grupo no disponible.', 'danger');
      return;
    }

    const allAlumnos = this.selectedGrupo.alumnos;
    const uniqueAlumnos = [...new Map(allAlumnos.map(item => [item['_id'], item])).values()];

    const modal = await this.modalController.create({
      component: CuestionarioModalComponent,
      componentProps: {
        rama: this.ramaNombre,
        cuestionario: cuestionario || null,
        alumnos: uniqueAlumnos,
        grupoId: this.selectedGrupo._id
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
  }

  async presentCompletarCuestionarioModal(cuestionarioId: string) {
    const modal = await this.modalController.create({
      component: CompletarCuestionarioModalComponent,
      componentProps: {
        cuestionarioId: cuestionarioId
      }
    });
    modal.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
