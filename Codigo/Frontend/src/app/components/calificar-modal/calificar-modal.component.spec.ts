import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalificarModalComponent } from './calificar-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('CalificarModalComponent', () => {
  let component: CalificarModalComponent;
  let fixture: ComponentFixture<CalificarModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalificarModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CalificarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
