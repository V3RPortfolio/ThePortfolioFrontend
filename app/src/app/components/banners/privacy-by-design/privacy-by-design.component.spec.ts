import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyByDesignComponent } from './privacy-by-design.component';

describe('PrivacyByDesignComponent', () => {
  let component: PrivacyByDesignComponent;
  let fixture: ComponentFixture<PrivacyByDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivacyByDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyByDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
