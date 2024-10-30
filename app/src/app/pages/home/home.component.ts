import { Component, OnInit } from '@angular/core';
import { OpenSourceBannerComponent } from '../../components/open-source-banner/open-source-banner.component';
import { ParallaxDirective } from '../../directives/parallax.directive';
import { HeroComponent } from '../../components/hero/hero.component';
import { FamiliarTechnologiesComponent } from '../../components/familiar-technologies/familiar-technologies.component';

import { NotificationBannerComponent } from '../../components/notification-banner/notification-banner.component';
import { HomeBannersComponent } from '../../components/home-banners/home-banners.component';
import { RelatedPostsComponent } from '../../components/related-posts/related-posts.component';
import { WPBackendService } from '../../services/wpbackend.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: true,
    imports: [
      NotificationBannerComponent,
      OpenSourceBannerComponent, 
      ParallaxDirective, 
      HeroComponent, 
      FamiliarTechnologiesComponent,
      HomeBannersComponent,
      RelatedPostsComponent,
    ]
})
export class HomeComponent implements OnInit {
  speed = 0.9;
  enabled = true;
  hideIntro:boolean = false;

  constructor(
    private backendService: WPBackendService
  ) {

  }

  ngOnInit(): void {
    // console.log(environment);
  }
}
