import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetronomeComponent } from './metronome.component';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonItem, IonLabel, IonRange } from '@ionic/angular/standalone';

describe('MetronomeComponent', () => {
  let component: MetronomeComponent;
  let fixture: ComponentFixture<MetronomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetronomeComponent, FormsModule, IonButton, IonIcon, IonItem, IonLabel, IonRange]
    }).compileComponents();

    fixture = TestBed.createComponent(MetronomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle play state', () => {
    spyOn(component, 'scheduler');
    component.toggleMetronome();
    expect(component.isPlaying).toBe(true);
    component.toggleMetronome();
    expect(component.isPlaying).toBe(false);
  });
});
