import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Tab4Page } from './tab4.page';
import { IonicModule } from '@ionic/angular';

describe('Tab4Page', () => {
  let component: Tab4Page;
  let fixture: ComponentFixture<Tab4Page>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [Tab4Page, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
