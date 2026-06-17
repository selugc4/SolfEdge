import { Tarea } from '../../models/tarea.model';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, inject, OnInit, LOCALE_ID, HostListener } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { TareaStateService } from 'src/app/services/tarea-state.service';
import { TareaService } from 'src/app/services/tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ToastController, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonBadge, IonListHeader, IonIcon } from '@ionic/angular/standalone';
import { Calificacion } from 'src/app/models/calificacion.model';
import { CalificarModalComponent } from 'src/app/components/calificar-modal/calificar-modal.component';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { addIcons } from 'ionicons';
import { trashOutline, closeCircleOutline, documentTextOutline } from 'ionicons/icons';
@Component({
  selector: 'app-tarea-detalle',
  templateUrl: './tarea-detalle.page.html',
  styleUrls: ['./tarea-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonBadge, IonListHeader, IonIcon]
})
export class TareaDetallePage implements OnInit {
  tarea: Tarea | undefined;
  entregas: Calificacion[] = [];
  pdfUrl: SafeResourceUrl | undefined;
  profesorNombre: string | undefined;
  isProfessor: boolean = false;
  isMobile = false;
  private tareaService: TareaService = inject(TareaService);
  private usuarioService: UsuarioService = inject(UsuarioService);
  private authService: AuthService = inject(AuthService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private toastController: ToastController = inject(ToastController);
  private modalCtrl: ModalController = inject(ModalController);
  private tareaStateService: TareaStateService = inject(TareaStateService);
  private location: Location = inject(Location);
  private nonSafeUrl: string = '';
  constructor() {
    addIcons({ 'trash-outline': trashOutline, 'close-circle-outline': closeCircleOutline, 'document-text-outline': documentTextOutline });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
      }
    });
    this.checkIsMobile();
    this.route.paramMap.subscribe(params => {
      const tareaId = params.get('id');
      if (tareaId) {
        this.loadTareaDetalle(tareaId);
      } else {
        this.presentToast('ID de tarea no proporcionado.', 'danger');
        this.router.navigate(['/Areas/Ritmo']);
      }
    });
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
      if (!this.tarea?.materialDeApoyo) return;
      const base64 = this.tarea.materialDeApoyo.includes(',')
        ? this.tarea.materialDeApoyo.split(',')[1]
        : this.tarea.materialDeApoyo;

      const fileName = `material-apoyo-${this.tarea._id || 'tarea'}.pdf`;

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
      this.presentToast('No se pudo abrir el PDF en este dispositivo.', 'danger');
    }
  }
  loadTareaDetalle(tareaId: string) {
    this.tareaService.getTareaById(tareaId).subscribe({
      next: (tarea) => {
        this.tarea = tarea;
        console.log('Tarea recibida:', tarea); // Debug
        if (this.isProfessor) {
          this.loadEntregas(tareaId);
        }
        if (this.tarea.profesor) {
          this.usuarioService.getUsuarioById(this.tarea.profesor).subscribe({
            next: (profesor: Usuario) => {
              this.profesorNombre = profesor.username;
            },
            error: (err) => {
              console.error('Error fetching professor details:', err);
              this.profesorNombre = 'Desconocido';
            }
          });
        }

        if (this.tarea.materialDeApoyo) {
            // Now rama is populated, we can access rama.nombre
            const ramaNombre = (this.tarea.rama as any).nombre;
            const isAudio = ramaNombre && ramaNombre.includes('Entonación');
            const mimeType = isAudio ? 'audio/mpeg' : 'application/pdf';
            
            const blob = this.b64toBlob(this.tarea.materialDeApoyo, mimeType);
            this.nonSafeUrl = URL.createObjectURL(blob);
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.nonSafeUrl);
        }
      },
      error: (err) => {
        this.presentToast(`Error al cargar la tarea: ${err.error.message || err.message}`, 'danger');
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

  loadEntregas(tareaId: string) {
    this.tareaService.getEntregasPorTarea(tareaId).subscribe({
      next: (entregas) => {
        this.entregas = entregas;
      },
      error: (err) => {
        this.presentToast(`Error al cargar las entregas: ${err.error.message || err.message}`, 'danger');
      }
    });
  }

  async openCalificarModal(entrega: Calificacion) {
    const modal = await this.modalCtrl.create({
      component: CalificarModalComponent,
      componentProps: {
        entrega: entrega
      }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      const index = this.entregas.findIndex(e => e._id === entrega._id);
      if (index !== -1) {
        this.entregas[index].nota = data.nota;
      }
    }
  }

  async closeTarea() {
    if (!this.tarea || !this.tarea._id) return;
    this.tareaService.closeTarea(this.tarea._id).subscribe({
      next: () => {
        this.presentToast('Tarea cerrada con éxito.');
        if (this.tarea) this.tarea.cerrada = true;
        this.tareaStateService.touch();
      },
      error: (err) => {
        this.presentToast(`Error al cerrar tarea: ${err.error.message || err.message}`, 'danger');
      }
    });
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
  async deleteTarea() {
    if (!this.tarea || !this.tarea._id) return;
    this.tareaService.deleteTarea(this.tarea._id).subscribe({
      next: () => {
        this.presentToast('Tarea eliminada con éxito.');
        this.tareaStateService.touch();
        this.location.back();
      },
      error: (err) => {
        this.presentToast(`Error al eliminar tarea: ${err.error.message || err.message}`, 'danger');
      }
    });
  }

  b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
