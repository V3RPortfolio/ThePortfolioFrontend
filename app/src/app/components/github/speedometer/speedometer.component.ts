import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-speedometer',
  standalone: true,
  imports: [],
  templateUrl: './speedometer.component.html',
  styleUrl: './speedometer.component.scss'
})
export class SpeedometerComponent {
  @Input('closed') closed: number;
  @Input('open') open: number;
  @Input('total') total: number;
}
