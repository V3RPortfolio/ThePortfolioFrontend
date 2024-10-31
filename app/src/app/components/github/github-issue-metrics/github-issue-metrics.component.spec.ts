import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubIssueMetricsComponent } from './github-issue-metrics.component';

describe('GithubIssueMetricsComponent', () => {
  let component: GithubIssueMetricsComponent;
  let fixture: ComponentFixture<GithubIssueMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GithubIssueMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GithubIssueMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
