import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { EntregarTareaModalComponent } from './entregar-tarea-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TareaService } from '../../services/tarea.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('EntregarTareaModalComponent', () => {
  let component: EntregarTareaModalComponent;
  let fixture: ComponentFixture<EntregarTareaModalComponent>;

  // Usa las referencias a los mocks para controlar spies
  let modalControllerMock: any;
  let toastControllerMock: any;
  let tareaServiceMock: any;

  beforeEach(waitForAsync(() => {
    modalControllerMock = {
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
    };

    toastControllerMock = {
      create: jasmine.createSpy('create').and.returnValue(
        Promise.resolve({
          present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
        })
      )
    };

    tareaServiceMock = {
      entregarTarea: jasmine.createSpy('entregarTarea').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      imports: [
        EntregarTareaModalComponent,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
        { provide: TareaService, useValue: tareaServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntregarTareaModalComponent);
    component = fixture.componentInstance;

    // Set input
    component.tareaId = 'tarea123';

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dismiss on cancel', () => {
    component.cancel();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should call entregarTarea on confirm when text is provided', fakeAsync(() => {
    component.form.controls['respuestaTexto'].setValue('Mi respuesta');

    spyOn(component, 'presentToast').and.returnValue(Promise.resolve());

    tareaServiceMock.entregarTarea.calls.reset();
    modalControllerMock.dismiss.calls.reset();

    component.confirm();
    tick();

    expect(tareaServiceMock.entregarTarea).toHaveBeenCalled();
    expect(modalControllerMock.dismiss).toHaveBeenCalled();
  }));

  it('should call entregarTarea on confirm when file is provided', fakeAsync(() => {
    const blob = new Blob([''], { type: 'text/html' });
    const file = new File([blob], 'test.txt');
    component.selectedFile = file;

    spyOn(component, 'presentToast').and.returnValue(Promise.resolve());

    tareaServiceMock.entregarTarea.calls.reset();
    modalControllerMock.dismiss.calls.reset();

    component.confirm();
    tick();

    expect(tareaServiceMock.entregarTarea).toHaveBeenCalled();
    expect(modalControllerMock.dismiss).toHaveBeenCalled();
  }));

  it('should not call entregarTarea on confirm when no data is provided', fakeAsync(() => {
    spyOn(component, 'presentToast').and.returnValue(Promise.resolve());

    tareaServiceMock.entregarTarea.calls.reset();
    modalControllerMock.dismiss.calls.reset();

    component.confirm();
    tick();

    expect(tareaServiceMock.entregarTarea).not.toHaveBeenCalled();
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    expect(component.presentToast).toHaveBeenCalledWith('Debes añadir un texto o un archivo para entregar.', 'danger');
  }));
});
