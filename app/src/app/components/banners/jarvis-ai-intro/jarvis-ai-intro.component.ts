import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-jarvis-ai-intro',
  templateUrl: './jarvis-ai-intro.component.html',
  styleUrl: './jarvis-ai-intro.component.scss',
  standalone: true,
  imports: [MatButton, MatIcon]
})
export class JarvisAiIntroComponent {

}
