import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransparentSpeedometerComponent } from './transparent-speedometer.component';

describe('TransparentSpeedometerComponent', () => {
  let component: TransparentSpeedometerComponent;
  let fixture: ComponentFixture<TransparentSpeedometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransparentSpeedometerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransparentSpeedometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
