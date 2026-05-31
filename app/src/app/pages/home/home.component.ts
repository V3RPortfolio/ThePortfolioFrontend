import { Component, OnInit } from '@angular/core';
import { ParallaxDirective } from '../../directives/parallax.directive';
import { HeroComponent } from '../../components/banners/hero/hero.component';

import { NotificationBannerComponent } from '../../components/banners/notification-banner/notification-banner.component';
import { HomeBannersComponent } from '../../components/banners/home-banners/home-banners.component';
import { RelatedPostsComponent } from '../../components/related-posts/related-posts.component';
import { GithubIssueMetricsComponent } from '../../components/github/github-issue-metrics/github-issue-metrics.component';

import { DataAnalyticsComponent } from '../../components/banners/data-analytics/data-analytics.component';
import { RagArchitectureComponent } from '../../components/banners/rag-architecture/rag-architecture.component';
import { IntrusionPreventionComponent } from '../../components/static-sections/intrusion-prevention/intrusion-prevention.component';
import { TargetPlatformComponent } from '../../components/target-platform/target-platform.component';
import { DataIngestionPipelineComponent } from '../../components/banners/data-ingestion-pipeline/data-ingestion-pipeline.component';
import { FamiliarTechnologiesComponent } from '../../components/static-sections/familiar-technologies/familiar-technologies.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: true,
    imports: [
      NotificationBannerComponent,
      
      DataIngestionPipelineComponent, 
      DataAnalyticsComponent,
      RagArchitectureComponent,
      IntrusionPreventionComponent,
      TargetPlatformComponent,

      ParallaxDirective, 
      HeroComponent, 
      FamiliarTechnologiesComponent,
      HomeBannersComponent,
      RelatedPostsComponent,
      GithubIssueMetricsComponent,
    ]
})
export class HomeComponent implements OnInit {
  speed = 0.9;
  enabled = true;
  hideIntro:boolean = false;

  constructor(
  ) {

  }

  ngOnInit(): void {
  }
}
