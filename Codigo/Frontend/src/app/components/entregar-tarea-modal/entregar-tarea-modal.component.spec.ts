import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EntregarTareaModalComponent } from './entregar-tarea-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('EntregarTareaModalComponent', () => {
  let component: EntregarTareaModalComponent;
  let fixture: ComponentFixture<EntregarTareaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EntregarTareaModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EntregarTareaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
