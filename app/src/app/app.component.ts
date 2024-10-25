import { AfterViewInit, Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { IntroBannerComponent } from './components/intro-banner/intro-banner.component';
import { NgClass } from '@angular/common';
import { sessionidKey } from './app.constants';

import { randomUUID } from 'crypto';
import { SessionManager } from './services/session.service';

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
export class AppComponent implements AfterViewInit {
  title = 'My Portfolio';
  hasPageLoaded = false;
  hideIntro = false;
  constructor(
    private sessionManager: SessionManager
  ) { 
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
