import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

import { SessionManager } from './services/session.service';
import { IntroBannerComponent } from './components/banners/intro-banner/intro-banner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
    IntroBannerComponent,
    NgClass
  ],
  providers: [SessionManager]
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'My Portfolio';
  hasPageLoaded = false;
  hideIntro = false;
  isHiddenFromStart = false;
  constructor(
    private sessionManager: SessionManager,
  ) { 
  }

  ngOnInit(): void {
    if(window.location.pathname != '/') this.isHiddenFromStart = true;
  }

  ngAfterViewInit(): void {
    if(!this.hasPageLoaded) {
      setTimeout(() => {
        this.hasPageLoaded = true;
        this.sessionManager.setSessionId();
      }, 500);
    }
  }

  onHideIntro(event: boolean) {
    this.hideIntro = event;
  }

}
