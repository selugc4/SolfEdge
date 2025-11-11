import { Tarea } from '../../models/tarea.model';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from 'src/app/services/tarea.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tarea-detalle',
  templateUrl: './tarea-detalle.page.html',
  styleUrls: ['./tarea-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton]
})
export class TareaDetallePage implements OnInit {
  tarea: Tarea | undefined;
  pdfUrl: SafeResourceUrl | undefined;
  profesorNombre: string | undefined;
  isProfessor: boolean = false;
  tareaService: TareaService = inject(TareaService);
  usuarioService: UsuarioService = inject(UsuarioService);
  authService: AuthService = inject(AuthService);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  toastController: ToastController = inject(ToastController);

  constructor() { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isProfessor = user.role === 'profesor';
      }
    });

    this.route.paramMap.subscribe(params => {
      const tareaId = params.get('id');
      if (tareaId) {
        this.loadTareaDetalle(tareaId);
      } else {
        this.presentToast('ID de tarea no proporcionado.', 'danger');
        this.router.navigate(['/tabs/tab1']); // Navigate back if no ID
      }
    });
  }

  loadTareaDetalle(tareaId: string) {
    this.tareaService.getTareaById(tareaId).subscribe({
      next: (tarea) => {
        this.tarea = tarea;
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
          // Assuming materialDeApoyo is a Base64 string
          const pdfBlob = this.b64toBlob(this.tarea.materialDeApoyo, 'application/pdf');
          const url = URL.createObjectURL(pdfBlob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      },
      error: (err) => {
        this.presentToast(`Error al cargar la tarea: ${err.error.message || err.message}`, 'danger');
        this.router.navigate(['/tabs/tab1']); // Navigate back on error
      }
    });
  }

  async closeTarea() {
    if (!this.tarea || !this.tarea._id) return;
    this.tareaService.closeTarea(this.tarea._id).subscribe({
      next: () => {
        this.presentToast('Tarea cerrada con éxito.');
        if (this.tarea) this.tarea.cerrada = true; // Update UI
      },
      error: (err) => {
        this.presentToast(`Error al cerrar tarea: ${err.error.message || err.message}`, 'danger');
      }
    });
  }

  async deleteTarea() {
    if (!this.tarea || !this.tarea._id) return;
    this.tareaService.deleteTarea(this.tarea._id).subscribe({
      next: () => {
        this.presentToast('Tarea eliminada con éxito.');
        this.router.navigate(['/tabs/tab1']); // Navigate back after deletion
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
