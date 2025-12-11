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
import { CuestionarioStateService } from '../../services/cuestionario-state.service';
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
import { EntregarTareaModalComponent } from '../../components/entregar-tarea-modal/entregar-tarea-modal.component';
import { forkJoin, of } from 'rxjs'; // Added forkJoin and of
import { finalize, switchMap, tap } from 'rxjs/operators'; // Added tap

@Component({
  selector: 'app-rama-detail',
  templateUrl: './rama-detail.page.html',
  styleUrls: ['./rama-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonFab, IonFabButton, RouterModule, IonToggle, IonSpinner] // Added IonSpinner
})
export class RamaDetailPage implements OnDestroy {
  title: string = '';
  readonly RAMA_NOMBRE = 'Teoria';
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
  private readonly cuestionarioStateService: CuestionarioStateService = inject(CuestionarioStateService); // Inject CuestionarioStateService
  private readonly tareaStateService: TareaStateService = inject(TareaStateService);
  private cuestionarioSubscription: Subscription | undefined; // Add cuestionarioSubscription
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

    this.cuestionarioSubscription = this.cuestionarioStateService.cuestionarioModified$.subscribe(() => {
      this.loadCuestionarios().subscribe(); // Subscribe to questionnaire changes
    });
  }

  ngOnDestroy() {
    if (this.tareaSubscription) {
      this.tareaSubscription.unsubscribe();
    }
    if (this.cuestionarioSubscription) { // Unsubscribe from questionnaire changes
      this.cuestionarioSubscription.unsubscribe();
    }
  }

  navigateToTask(taskId: string): void {
    this.router.navigate(['/Tarea-detalle', taskId]);
  }

  trackByTarea(index: number, tarea: Tarea): string {
    return tarea._id;
  }

  trackByCuestionario(index: number, cuestionario: Cuestionario): string {
    return cuestionario._id;
  }

  ionViewWillEnter() {
    this.isLoading = true; // Set loading to true
    this.route.data.subscribe(data => {
      this.title = data['title'];
      this.ramaNombre = data['ramaNombre'];
      this.isTeoria = this.ramaNombre === 'Teoria';
    });

    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
        this.userId = user._id;
        this.grupoStateService.selectedGrupo$.subscribe(grupo => {
          this.selectedGrupo = grupo;
      if (grupo) {
        this.isLoading = true;

        this.loadRamaConfig(grupo._id).pipe(
          switchMap(() =>
            forkJoin([
              this.loadTareas(),
              this.isTeoria ? this.loadCuestionarios() : of([])
            ])
          ),
          finalize(() => {
            this.isLoading = false; // Siempre se ejecuta
          })
        ).subscribe({
          error: (err) => {
            console.error('Error cargando datos', err);
          }
        });

      } else {
        this.tareas = [];
        this.cuestionarios = [];
        this.ramaConfig = undefined;
        this.pdfUrl = null;
        this.hasLibroDeApoyo = false;
        this.isLoading = false;
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
    return this.tareaService.getTareasByUsuarioAndRama(this.userId, this.ramaConfig!._id).pipe(
      tap(tareas => {
        this.tareas = tareas;
      })
    );
  }

  loadCuestionarios() {
    if (!this.userId) return of([]); // Return an observable
    return this.cuestionarioService.getCuestionariosByUsuarioAndRama(this.userId, this.ramaConfig!._id).pipe(
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
        rama: this.ramaConfig?._id,
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
    if (!this.userId || !this.selectedGrupo || !this.ramaNombre) {
      this.presentToast('Error: ID de usuario, grupo o rama no disponible.', 'danger');
      return;
    }

    const navigationExtras = {
      queryParams: {
        rama: this.ramaConfig?._id,
        grupoId: this.selectedGrupo._id
      }
    };

    if (cuestionario) {
      this.router.navigate(['/Cuestionario-edit', cuestionario._id], navigationExtras);
    } else {
      this.router.navigate(['/Cuestionario-edit'], navigationExtras);
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
    this.router.navigate(['/Cuestionario-completar', cuestionarioId]);
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
