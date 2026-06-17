import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonItem, IonLabel, IonRange } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, square } from 'ionicons/icons';

@Component({
  selector: 'app-metronome',
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonItem, IonLabel, IonRange]
})
export class MetronomeComponent implements OnDestroy {
  bpm: number = 120;
  isPlaying: boolean = false;
  audioCtx: AudioContext | null = null;
  nextTickTime: number = 0;
  timerID: any = null;

  constructor() {
    addIcons({ play, square });
  }

  async toggleMetronome() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      await this.audioCtx.resume();
      
      this.nextTickTime = this.audioCtx.currentTime + 0.05;
      this.scheduler();
    } else {
      clearTimeout(this.timerID);
      await this.audioCtx?.close();
      this.audioCtx = null;
    }
  }

  scheduler() {
    if (!this.isPlaying) return;

    const currentTime = this.audioCtx?.currentTime || 0;
    while (this.nextTickTime < currentTime + 0.1) {
      this.playClick(this.nextTickTime);
      this.nextTickTime += 60.0 / this.bpm;
    }
    this.timerID = setTimeout(() => this.scheduler(), 25);
  }

  playClick(time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const envelope = this.audioCtx.createGain();

    // Revertir a onda sinusoidal para un sonido más limpio y recuperar ganancia anterior
    osc.type = 'sine';
    osc.frequency.value = 1200; 
    
    // Nivel de ganancia 5.0 (volumen alto pero limpio)
    envelope.gain.value = 5.0; 
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1); 

    osc.connect(envelope);
    envelope.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  stop() {
    if (this.isPlaying) {
      this.toggleMetronome();
    }
  }

  ngOnDestroy() {
    if (this.isPlaying) {
      this.toggleMetronome();
    }
  }
}
