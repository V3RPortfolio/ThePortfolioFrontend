import { Component, Input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-previewer',
  templateUrl: './markdown-previewer.component.html',
  styleUrl: './markdown-previewer.component.scss',
  standalone: true,
  imports: [
    MarkdownComponent,
  ],
})
export class MarkdownPreviewerComponent {
  @Input() title: string = '';
  @Input() markdown: string = '';
}
