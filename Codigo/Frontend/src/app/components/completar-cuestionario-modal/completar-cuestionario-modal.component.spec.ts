import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CompletarCuestionarioModalComponent } from './completar-cuestionario-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CompletarCuestionarioModalComponent', () => {
  let component: CompletarCuestionarioModalComponent;
  let fixture: ComponentFixture<CompletarCuestionarioModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CompletarCuestionarioModalComponent, IonicModule.forRoot(), ReactiveFormsModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CompletarCuestionarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
