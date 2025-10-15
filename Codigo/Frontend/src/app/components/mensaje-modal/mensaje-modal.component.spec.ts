import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MensajeModalComponent } from './mensaje-modal.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

describe('MensajeModalComponent', () => {
  let component: MensajeModalComponent;
  let fixture: ComponentFixture<MensajeModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MensajeModalComponent, IonicModule.forRoot(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
