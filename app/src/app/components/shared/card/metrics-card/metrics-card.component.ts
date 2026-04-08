import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransparentSpeedometerComponent } from '../../gauges/transparent-speedometer/transparent-speedometer.component';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule, TransparentSpeedometerComponent],
  templateUrl: './metrics-card.component.html',
  styleUrl: './metrics-card.component.scss',
})
export class MetricsCardComponent {
  @Input() title: string;
  @Input() value: number = 0;
  @Input() unit?: string;
  @Input() isPercentage: boolean = false;

  
}

