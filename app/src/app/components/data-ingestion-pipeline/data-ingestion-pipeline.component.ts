import { Component } from '@angular/core';
import { fadeInEnterFromLeft } from '../../services/triggers.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-data-ingestion-pipeline',
  templateUrl: './data-ingestion-pipeline.component.html',
  styleUrl: './data-ingestion-pipeline.component.scss',
  animations: [
      fadeInEnterFromLeft(1000, { marginLeft: '-100px' }, { marginLeft: '0' })
  ],
  standalone: true,
  imports: [MatButton, MatIcon]
})
export class DataIngestionPipelineComponent {

}
