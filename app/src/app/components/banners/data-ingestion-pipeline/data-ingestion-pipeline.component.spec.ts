import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIngestionPipelineComponent } from './data-ingestion-pipeline.component';

describe('DataIngestionPipelineComponent', () => {
  let component: DataIngestionPipelineComponent;
  let fixture: ComponentFixture<DataIngestionPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataIngestionPipelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIngestionPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
