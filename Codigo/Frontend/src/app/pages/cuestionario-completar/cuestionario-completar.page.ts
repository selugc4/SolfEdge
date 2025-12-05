import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Cuestionario } from '../../models/cuestionario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonRadio, IonRadioGroup, ToastController, IonBackButton, IonListHeader, IonLabel } from "@ionic/angular/standalone";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Import DomSanitizer and SafeResourceUrl

@Component({
  selector: 'app-cuestionario-completar',
  templateUrl: './cuestionario-completar.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonRadio, IonRadioGroup, IonBackButton, IonListHeader, IonLabel]
})
export class CuestionarioCompletarPage implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private cuestionarioService = inject(CuestionarioService);
  private tareaStateService = inject(TareaStateService);
  private toastCtrl = inject(ToastController);
  private domSanitizer: DomSanitizer = inject(DomSanitizer); // Inject DomSanitizer

  cuestionarioId: string | null = null;
  cuestionario: Cuestionario | null = null;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.cuestionarioId = this.route.snapshot.paramMap.get('id');
    if (this.cuestionarioId) {
      this.cuestionarioService.getCuestionarioById(this.cuestionarioId).subscribe(cuestionario => {
        this.cuestionario = cuestionario;
        // Create a form control for each question
        this.cuestionario.preguntas.forEach((pregunta, index) => {
          this.form.addControl(index.toString(), new FormControl('', Validators.required));
        });
      });
    } else {
        this.presentToast('ID de cuestionario no proporcionado.', 'danger');
        this.location.back();
    }
  }

  // Helper to check if resource is Base64 audio
  isBase64Audio(resource: string | undefined): boolean {
    return resource ? resource.startsWith('data:audio/mpeg;base64,') : false;
  }

  // Helper to get safe URL for Base64 audio
  getSafeBase64Url(resource: string | undefined): SafeResourceUrl | null {
    return resource ? this.domSanitizer.bypassSecurityTrustResourceUrl(resource) : null;
  }

  // Helper to check if resource is a YouTube URL and extract video ID
  isYouTubeUrl(resource: string | undefined): string | null {
    if (!resource) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = resource.match(youtubeRegex);
    return match && match[1] ? match[1] : null;
  }

  // Helper to check if resource is a Spotify URL and extract ID
  isSpotifyUrl(resource: string | undefined): { type: string, id: string } | null {
    if (!resource) return null;
    const spotifyRegex = /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;
    const match = resource.match(spotifyRegex);
    return match && match[1] && match[2] ? { type: match[1], id: match[2] } : null;
  }

  // Helper to get safe YouTube embed URL
  getYouTubeEmbedUrl(videoId: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  // Helper to get safe Spotify embed URL
  getSpotifyEmbedUrl(type: string, id: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/${type}/${id}`);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.presentToast('Por favor, responde a todas las preguntas.', 'danger');
      return;
    }

    const respuestasArray = Object.keys(this.form.value)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(questionIndexStr => {
        const answerIndex = this.form.value[questionIndexStr];
        return answerIndex.toString();
      });

    this.cuestionarioService.entregarCuestionario(this.cuestionarioId!, respuestasArray).subscribe({
      next: (calificacion) => {
        this.presentToast(`Cuestionario entregado. Tu nota es: ${calificacion.nota.toFixed(2)}`, 'success');
        this.tareaStateService.touch();
        this.location.back();
      },
      error: (err) => {
        this.presentToast(`Error al entregar: ${err.error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 4000, color });
    toast.present();
  }
}
