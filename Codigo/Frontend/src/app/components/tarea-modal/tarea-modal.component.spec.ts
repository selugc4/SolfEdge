import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TareaModalComponent } from './tarea-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('TareaModalComponent', () => {
  let component: TareaModalComponent;
  let fixture: ComponentFixture<TareaModalComponent>;

  const authServiceMock = { currentUserValue: { _id: 'prof1' } };
  const toastControllerMock = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') })) };
  const modalControllerMock = { dismiss: jasmine.createSpy('dismiss') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TareaModalComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: ModalController, useValue: modalControllerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TareaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept PDF for any branch', () => {
    component.rama = 'Ritmo';
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(mockFile);
  });

  it('should accept MP3 for Entonación branch', () => {
    component.rama = 'Entonación';
    const mockFile = new File([''], 'test.mp3', { type: 'audio/mpeg' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(mockFile);
  });

  it('should reject MP3 for Ritmo branch', () => {
    component.rama = 'Ritmo';
    const mockFile = new File([''], 'test.mp3', { type: 'audio/mpeg' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
  });
});
