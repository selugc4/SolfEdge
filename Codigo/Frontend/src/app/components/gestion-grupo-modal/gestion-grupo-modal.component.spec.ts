import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { GestionGrupoModalComponent } from './gestion-grupo-modal.component';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { GrupoService } from 'src/app/services/grupo.service';
import { of, throwError } from 'rxjs';
import { Grupo } from 'src/app/models/grupo.model';

describe('GestionGrupoModalComponent', () => {
  let component: GestionGrupoModalComponent;
  let fixture: ComponentFixture<GestionGrupoModalComponent>;

  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let grupoServiceSpy: jasmine.SpyObj<GrupoService>;

  let toastPresentSpy: jasmine.Spy;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    grupoServiceSpy = jasmine.createSpyObj('GrupoService', ['deleteGrupo']);

    toastPresentSpy = jasmine.createSpy('present').and.returnValue(Promise.resolve());

    toastControllerSpy.create.and.returnValue(
      Promise.resolve({ present: toastPresentSpy } as any)
    );

    // Por defecto, que no rompa si se llama sin configurar en un test
    grupoServiceSpy.deleteGrupo.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [GestionGrupoModalComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: GrupoService, useValue: grupoServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionGrupoModalComponent);
    component = fixture.componentInstance;

    // Importante: setear el @Input antes de detectChanges si el test lo necesita
    component.selectedGrupo = { _id: 'grupo123' } as Grupo;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss the modal', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('deleteGrupo should call service, show success toast, and dismiss with confirm', fakeAsync(() => {
    // Arrange
    component.selectedGrupo = { _id: 'grupo123' } as Grupo;
    grupoServiceSpy.deleteGrupo.and.returnValue(of(null));
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();
    modalControllerSpy.dismiss.calls.reset();

    // Act
    component.deleteGrupo();

    // Resolver await del toast
    flushMicrotasks();
    tick();

    // Assert
    expect(grupoServiceSpy.deleteGrupo).toHaveBeenCalledWith('grupo123');

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Grupo eliminado correctamente.',
      duration: 3000,
      color: 'success',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(null, 'confirm');
  }));

  it('deleteGrupo should show error toast if service fails', fakeAsync(() => {
    // Arrange
    component.selectedGrupo = { _id: 'grupo123' } as Grupo;
    grupoServiceSpy.deleteGrupo.and.returnValue(
      throwError(() => ({ error: { error: 'Fallo en el servidor' } }))
    );
    toastControllerSpy.create.calls.reset();
    toastPresentSpy.calls.reset();
    modalControllerSpy.dismiss.calls.reset();

    // Act
    component.deleteGrupo();

    flushMicrotasks();
    tick();

    // Assert
    expect(grupoServiceSpy.deleteGrupo).toHaveBeenCalledWith('grupo123');

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Error al eliminar el grupo: Fallo en el servidor',
      duration: 3000,
      color: 'danger',
    });
    expect(toastPresentSpy).toHaveBeenCalled();

    expect(modalControllerSpy.dismiss).not.toHaveBeenCalledWith(null, 'confirm');
  }));
});
