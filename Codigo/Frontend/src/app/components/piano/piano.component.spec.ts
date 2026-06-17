import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PianoComponent } from './piano.component';

describe('PianoComponent', () => {
  let component: PianoComponent;
  let fixture: ComponentFixture<PianoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PianoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PianoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should play a note', () => {
    spyOn(component.audioCtx, 'createOscillator').and.callThrough();
    component.playNote(440);
    expect(component.audioCtx.createOscillator).toHaveBeenCalled();
  });
});
