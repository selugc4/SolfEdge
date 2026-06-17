import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PianoComponent {
  audioCtx: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  notes = [
    { note: 'C', freq: 261.63 },
    { note: 'C#', freq: 277.18 },
    { note: 'D', freq: 293.66 },
    { note: 'D#', freq: 311.13 },
    { note: 'E', freq: 329.63 },
    { note: 'F', freq: 349.23 },
    { note: 'F#', freq: 369.99 },
    { note: 'G', freq: 392.00 },
    { note: 'G#', freq: 415.30 },
    { note: 'A', freq: 440.00 },
    { note: 'A#', freq: 466.16 },
    { note: 'B', freq: 493.88 },
    { note: 'C', freq: 523.25 }
  ];

  playNote(freq: number) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 1);
  }
}
