import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KernelLevelSecurityComponent } from './kernel-level-security.component';

describe('KernelLevelSecurityComponent', () => {
  let component: KernelLevelSecurityComponent;
  let fixture: ComponentFixture<KernelLevelSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KernelLevelSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KernelLevelSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
