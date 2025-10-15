import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Tab5Page } from './tab5.page';
import { IonicModule } from '@ionic/angular';

describe('Tab5Page', () => {
  let component: Tab5Page;
  let fixture: ComponentFixture<Tab5Page>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [Tab5Page, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab5Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
