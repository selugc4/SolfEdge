import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificarCuestionarioModalComponent } from './calificar-cuestionario-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('CalificarCuestionarioModalComponent', () => {
  let component: CalificarCuestionarioModalComponent;
  let fixture: ComponentFixture<CalificarCuestionarioModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalificarCuestionarioModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificarCuestionarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
