import { Component, HostListener, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, IonButtons, IonMenuButton, ModalController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonIcon, IonToggle, IonSpinner, IonFab, IonFabButton, ActionSheetController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, addCircleOutline, cloudUploadOutline, createOutline, documentTextOutline, ribbonOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, ellipsisVertical } from 'ionicons/icons';

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
import { forkJoin, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-rama-detail',
  templateUrl: './rama-detail.page.html',
  styleUrls: ['./rama-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonButtons, RouterModule, IonToggle, IonSpinner, IonFab, IonFabButton] // Added IonSpinner
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
  private libroBlob: Blob | null = null;
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
  private readonly cuestionarioStateService: CuestionarioStateService = inject(CuestionarioStateService);
  private readonly tareaStateService: TareaStateService = inject(TareaStateService);
  private cuestionarioSubscription: Subscription | undefined;
  private tareaSubscription: Subscription | undefined;
  isMobile= false;
  nonSafeUrl: string = '';
  actionSheetCtrl: ActionSheetController = inject(ActionSheetController);

  constructor() {
    addIcons({
      add,
      addCircleOutline,
      cloudUploadOutline,
      createOutline,
      documentTextOutline,
      ribbonOutline,
      trashOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      ellipsisVertical
    });

    this.tareaSubscription = this.tareaStateService.tareaModified$.subscribe(() => {
      this.loadTareas().subscribe();
    });

    this.cuestionarioSubscription = this.cuestionarioStateService.cuestionarioModified$.subscribe(() => {
      this.loadCuestionarios().subscribe();
    });
  }
  ngOnInit(){

  }
  ngOnDestroy() {
    if (this.tareaSubscription) {
      this.tareaSubscription.unsubscribe();
    }
    if (this.cuestionarioSubscription) {
      this.cuestionarioSubscription.unsubscribe();
    }
    if (this.nonSafeUrl) {
      URL.revokeObjectURL(this.nonSafeUrl);
    }
  }
  @HostListener('window:resize')
  onResize() {
    this.checkIsMobile();
  }

  private checkIsMobile(): void {
    this.isMobile = window.matchMedia('(max-width: 1368px)').matches;
  }
async openPdf(): Promise<void> {
  try {
    if (!this.libroBlob) {
      await this.presentToast('No hay PDF disponible para abrir.', 'danger');
      return;
    }

    const base64 = await this.blobToBase64(this.libroBlob);
    const fileName = `libro-apoyo-${this.ramaConfig?._id || 'rama'}.pdf`;

    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });

    await FileOpener.open({
      filePath: result.uri,
      contentType: 'application/pdf',
      openWithDefault: true,
    });
  } catch (e) {
    console.error(e);
    await this.presentToast('No se pudo abrir el PDF en este dispositivo.', 'danger');
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
  async openProfessorMenu(tarea: any) {
    const buttons: any[] = [
      {
        text: 'Editar tarea',
        icon: 'create-outline',
        handler: () => this.presentTareaModal(tarea)
      }
    ];

    if (!this.isTareaClosed(tarea)) {
      buttons.push({
        text: 'Cerrar tarea',
        icon: 'close-circle-outline',
        handler: () => this.closeTarea(tarea._id)
      });
    }

    buttons.push(
      {
        text: 'Eliminar tarea',
        role: 'destructive',
        icon: 'trash-outline',
        handler: () => this.deleteTarea(tarea._id)
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    );

    const sheet = await this.actionSheetCtrl.create({ buttons });
    await sheet.present();
  }
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error leyendo el PDF'));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }

  async openCuestionarioMenu(cuestionario: any) {
    const buttons: any[] = [
      {
        text: 'Editar cuestionario',
        icon: 'create-outline',
        handler: () => this.presentCuestionarioModal(cuestionario)
      }
    ];

    if (!this.isCuestionarioClosed(cuestionario)) {
      buttons.push({
        text: 'Cerrar cuestionario',
        icon: 'close-circle-outline',
        handler: () => this.closeCuestionario(cuestionario._id)
      });
    }

    buttons.push(
      {
        text: 'Eliminar cuestionario',
        role: 'destructive',
        icon: 'trash-outline',
        handler: () => this.deleteCuestionario(cuestionario._id)
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    );

    const sheet = await this.actionSheetCtrl.create({ buttons });
    await sheet.present();
  }
  ionViewWillEnter() {
    this.isLoading = true;
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
                this.isLoading = false;
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
          this.checkIsMobile();
        });
      } else {
        this.isLoading = false;
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
              this.libroBlob = pdfBlob;
              this.nonSafeUrl = URL.createObjectURL(pdfBlob);
              this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.nonSafeUrl);
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
    if (!this.userId) return of([]);
    return this.tareaService.getTareasByUsuarioAndRama(this.userId, this.ramaConfig!._id).pipe(
      tap(tareas => {
        this.tareas = tareas;
      })
    );
  }

  loadCuestionarios() {
    if (!this.userId) return of([]);
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
          this.zone.run(() => {
            this.presentToast('Libro subido con éxito.');
            if (this.selectedGrupo) {
              this.loadRamaConfig(this.selectedGrupo._id).subscribe();
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
            if (this.ramaConfig) {
              this.ramaConfigService.updateRamaPdf(this.ramaConfig._id, null).subscribe({
                next: () => {
                  this.zone.run(() => {
                    this.presentToast('Libro eliminado.');

                    if (this.nonSafeUrl) URL.revokeObjectURL(this.nonSafeUrl);
                    this.nonSafeUrl = '';
                    this.libroBlob = null;

                    this.pdfUrl = null;
                    this.hasLibroDeApoyo = false;
                  });
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
