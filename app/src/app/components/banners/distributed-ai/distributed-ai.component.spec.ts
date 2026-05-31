import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributedAiComponent } from './distributed-ai.component';

describe('DistributedAiComponent', () => {
  let component: DistributedAiComponent;
  let fixture: ComponentFixture<DistributedAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistributedAiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistributedAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
