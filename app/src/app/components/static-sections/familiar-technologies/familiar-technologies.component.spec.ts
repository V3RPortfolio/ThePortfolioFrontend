import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamiliarTechnologiesComponent } from './familiar-technologies.component';

describe('FamiliarTechnologiesComponent', () => {
  let component: FamiliarTechnologiesComponent;
  let fixture: ComponentFixture<FamiliarTechnologiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FamiliarTechnologiesComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(FamiliarTechnologiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
