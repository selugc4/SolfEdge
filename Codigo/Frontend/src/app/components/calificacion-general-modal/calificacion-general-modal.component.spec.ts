import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificacionGeneralModalComponent } from './calificacion-general-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('CalificacionGeneralModalComponent', () => {
  let component: CalificacionGeneralModalComponent;
  let fixture: ComponentFixture<CalificacionGeneralModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalificacionGeneralModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificacionGeneralModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
