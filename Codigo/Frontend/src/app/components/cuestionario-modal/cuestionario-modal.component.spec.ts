import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CuestionarioModalComponent } from './cuestionario-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('CuestionarioModalComponent', () => {
  let component: CuestionarioModalComponent;
  let fixture: ComponentFixture<CuestionarioModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CuestionarioModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CuestionarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
