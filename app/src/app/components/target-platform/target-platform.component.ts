import { Component } from '@angular/core';
import { ParallaxDirective } from '../../directives/parallax.directive';

@Component({
  selector: 'app-target-platform',
  templateUrl: './target-platform.component.html',
  styleUrl: './target-platform.component.scss',
  standalone: true,
  imports: [
    ParallaxDirective
  ]
})
export class TargetPlatformComponent {
  technologyImagePath = 'icons/technologies';
  technologies = [
    {
      name: 'Windows',
      level: '80%',
      icon: 'windows.png'
    },{
      name: 'Linux',
      level: '80%',
      icon: 'linux.svg'
    },
    {
      name: 'Android',
      level: '80%',
      icon: 'android.svg'
    },
    {
      name: 'Smart Adapters',
      level: '80%',
      icon: 'raspberry.svg'
    }
  ]
}
