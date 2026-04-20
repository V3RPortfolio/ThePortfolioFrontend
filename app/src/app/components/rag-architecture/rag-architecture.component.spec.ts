import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagArchitectureComponent } from './rag-architecture.component';

describe('RagArchitectureComponent', () => {
  let component: RagArchitectureComponent;
  let fixture: ComponentFixture<RagArchitectureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagArchitectureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagArchitectureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
