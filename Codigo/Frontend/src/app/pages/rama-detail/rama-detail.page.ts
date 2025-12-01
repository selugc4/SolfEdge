import { Component, inject, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, IonButtons, IonMenuButton, ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonToggle, IonSpinner } from '@ionic/angular/standalone'; // Added IonSpinner
import { addIcons } from 'ionicons';
import { add, cloudUploadOutline, createOutline, documentTextOutline, ribbonOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

import { RamaConfigService } from '../../services/rama-config.service';
import { TareaService } from '../../services/tarea.service';
import { CuestionarioService } from '../../services/cuestionario.service';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { Subscription } from 'rxjs';

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
import { forkJoin, of } from 'rxjs'; // Added forkJoin and of
import { tap } from 'rxjs/operators'; // Added tap

@Component({
  selector: 'app-rama-detail',
  templateUrl: './rama-detail.page.html',
  styleUrls: ['./rama-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton, RouterModule, IonToggle, IonSpinner] // Added IonSpinner
})
export class RamaDetailPage implements OnDestroy {
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
  isLoading: boolean = true; // Added isLoading

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
  private readonly router: Router = inject(Router);
  private readonly zone: NgZone = inject(NgZone);
  private readonly tareaStateService: TareaStateService = inject(TareaStateService);
  private tareaSubscription: Subscription | undefined;

  constructor() {
    addIcons({
      add,
      cloudUploadOutline,
      createOutline,
      documentTextOutline,
      ribbonOutline,
      trashOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });

    this.tareaSubscription = this.tareaStateService.tareaModified$.subscribe(() => {
      this.loadTareas().subscribe();
    });
  }

  ngOnDestroy() {
    if (this.tareaSubscription) {
      this.tareaSubscription.unsubscribe();
    }
  }

  navigateToTask(taskId: string): void {
    this.router.navigate(['/tarea-detalle', taskId]);
  }

  ionViewWillEnter() {
    this.isLoading = true; // Set loading to true
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
            forkJoin([
              this.loadTareas(),
              this.loadRamaConfig(grupo._id),
              this.isTeoria ? this.loadCuestionarios() : of([]) // Handle conditional loading
            ]).subscribe(() => {
              this.isLoading = false; // Set to false after all data is loaded
            }, () => {
              this.isLoading = false; // Also set to false on error
            });
          } else {
            this.tareas = [];
            this.cuestionarios = [];
            this.ramaConfig = undefined;
            this.pdfUrl = null;
            this.hasLibroDeApoyo = false;
            this.isLoading = false; // Set to false if no group
          }
        });
      } else {
        this.isLoading = false; // Set to false if no user
      }
    });
  }

  loadRamaConfig(grupoId: string) {
    return this.ramaConfigService.getAllRamas().pipe(
      tap(ramas => {
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
      })
    );
  }

  loadTareas() {
    if (!this.userId) return of([]); // Return an observable
    return this.tareaService.getTareasByUsuarioAndRama(this.userId, this.ramaNombre).pipe(
      tap(tareas => {
        this.tareas = tareas;
      })
    );
  }

  loadCuestionarios() {
    if (!this.userId) return of([]); // Return an observable
    return this.cuestionarioService.getCuestionariosByUsuarioAndRama(this.userId, this.ramaNombre).pipe(
      tap(cuestionarios => {
        this.cuestionarios = cuestionarios;
      })
    );
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
              this.zone.run(() => {
                this.presentToast('Tarea eliminada.');
                this.loadTareas().subscribe();
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
              this.zone.run(() => {
                this.presentToast('Cuestionario eliminado.');
                this.loadCuestionarios().subscribe();
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async closeTarea(tareaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre',
      message: '¿Estás seguro de que quieres cerrar esta tarea? No se aceptarán más entregas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar',
          handler: () => {
            this.tareaService.closeTarea(tareaId).subscribe(() => {
              this.zone.run(() => {
                this.presentToast('Tarea cerrada.');
                this.loadTareas().subscribe();
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async closeCuestionario(cuestionarioId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre',
      message: '¿Estás seguro de que quieres cerrar este cuestionario? No se aceptarán más entregas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar',
          handler: () => {
            this.cuestionarioService.closeCuestionario(cuestionarioId).subscribe(() => {
              this.zone.run(() => {
                this.presentToast('Cuestionario cerrado.');
                this.loadCuestionarios().subscribe();
              });
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
        this.tareaService.updateTarea(tarea._id, formData).subscribe({
          next: () => {
            this.presentToast('Tarea actualizada con éxito.');
            this.loadTareas().subscribe();
          },
          error: (err) => {
            this.presentToast(`Error al actualizar tarea: ${err.error.message || err.message}`, 'danger');
          }
        });
      } else {
        this.tareaService.crearTarea(formData).subscribe({
          next: () => {
            this.presentToast('Tarea creada con éxito.');
            this.loadTareas().subscribe();
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
        rama: 'Teoria',
        alumnos: data.alumnos,
        profesor: this.userId,
        fechaCierre: data.fechaCierre
      };

      if (cuestionario) {
        this.cuestionarioService.updateCuestionario(cuestionario._id, cuestionarioData).subscribe({
          next: () => {
            this.presentToast('Cuestionario actualizado con éxito.');
            this.loadCuestionarios().subscribe();
          },
          error: (err) => {
            this.presentToast(`Error al actualizar cuestionario: ${err.error.message || err.message}`, 'danger');
          }
        });
      } else {
        this.cuestionarioService.crearCuestionario(cuestionarioData).subscribe({
          next: () => {
            this.presentToast('Cuestionario creado con éxito.');
            this.loadCuestionarios().subscribe();
          },
          error: (err) => {
            this.presentToast(`Error al crear cuestionario: ${err.error.message || err.message}`, 'danger');
          }
        });
      }
    }
  }
  isTareaClosed(tarea: Tarea): boolean {
    if (tarea.cerrada) {
      return true;
    }
    if (tarea.fechaCierre) {
      return new Date() > new Date(tarea.fechaCierre);
    }
    return false;
  }
  isCuestionarioClosed(cuestionario: Cuestionario): boolean {
    if (cuestionario.cerrada) {
      return true;
    }
    if (cuestionario.fechaCierre) {
      return new Date() > new Date(cuestionario.fechaCierre);
    }
    return false;
  }
  async presentEntregarTareaModal(tareaId: string) {
    const modal = await this.modalController.create({
      component: EntregarTareaModalComponent,
      componentProps: {
        tareaId: tareaId
      }
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadTareas().subscribe();
    }
  }

  async presentCompletarCuestionarioModal(cuestionarioId: string) {
    const modal = await this.modalController.create({
      component: CompletarCuestionarioModalComponent,
      componentProps: {
        cuestionarioId: cuestionarioId
      }
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadCuestionarios().subscribe();
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
