import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntrusionPreventionComponent } from './intrusion-prevention.component';

describe('IntrusionPreventionComponent', () => {
  let component: IntrusionPreventionComponent;
  let fixture: ComponentFixture<IntrusionPreventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IntrusionPreventionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntrusionPreventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
