import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { GithubIssueMetric } from '../../../interfaces/djadmin/github.interface';
import { GithubIssueMetricGQL } from '../../../services/djadmin/github-graphql.service';
import { NgFor } from '@angular/common';
import { Subscription } from 'rxjs';
import { SpeedometerComponent } from '../speedometer/speedometer.component';

@Component({
  selector: 'app-github-issue-metrics',
  templateUrl: './github-issue-metrics.component.html',
  styleUrl: './github-issue-metrics.component.scss',
  standalone: true,
  imports: [
    NgFor,
    SpeedometerComponent
  ]
})
export class GithubIssueMetricsComponent implements AfterViewInit, OnDestroy {
  metrics:GithubIssueMetric[] = [];
  metricsSubscription:Subscription;

  constructor(
    private githubIssueMetricGQL:GithubIssueMetricGQL
  ) {

  }

  ngAfterViewInit(): void {
    this.metricsSubscription = this.githubIssueMetricGQL.fetch().subscribe({
      next: (response) => {
        console.log('resp', response);
        if(!response || !response.data || !response.data[this.githubIssueMetricGQL.fieldName] || response.errors)  {
          if(response.errors) console.error(response.errors);
          else console.error('No data found');
          return;
        }
        this.metrics = response.data[this.githubIssueMetricGQL.fieldName];
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ngOnDestroy(): void {
    if(this.metricsSubscription) this.metricsSubscription.unsubscribe();
  }
}
