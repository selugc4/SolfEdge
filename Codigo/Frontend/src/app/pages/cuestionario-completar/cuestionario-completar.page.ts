import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Cuestionario } from '../../models/cuestionario.model';
import { CuestionarioService } from '../../services/cuestionario.service';
import { TareaStateService } from '../../services/tarea-state.service';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonRadio, IonRadioGroup, ToastController, IonBackButton, IonListHeader, IonLabel } from "@ionic/angular/standalone";

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

  onSubmit() {
    if (this.form.invalid) {
      this.presentToast('Por favor, responde a todas las preguntas.', 'danger');
      return;
    }

    const respuestasArray = Object.keys(this.form.value)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => this.form.value[key]);

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
