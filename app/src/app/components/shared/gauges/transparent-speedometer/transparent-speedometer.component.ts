import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transparent-speedometer',
  templateUrl: './transparent-speedometer.component.html',
  styleUrl: './transparent-speedometer.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class TransparentSpeedometerComponent {
  @Input() percentage: number = 30;

  get radius(): number {
    return 48;
  }

  get halfCircumference(): number {
    return Math.PI * this.radius;
  }
  
  get clamped(): number {
    return Math.min(Math.max(this.percentage, 0), 100);
  }

  get strokeDashoffset(): number {
    return this.halfCircumference * (1 - this.clamped / 100);
  }
}
