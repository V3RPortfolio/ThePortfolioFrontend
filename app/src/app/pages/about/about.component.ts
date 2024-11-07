import { Component } from '@angular/core';
import { IntroBannerComponent } from '../../components/intro-banner/intro-banner.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  standalone: true,
  imports: [
    IntroBannerComponent
  ]
})
export class AboutComponent {

}
