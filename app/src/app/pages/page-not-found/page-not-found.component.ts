import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutePaths } from '../../app.constants';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
  standalone: true,
  imports: [
    MatButton
  ],
  animations: [
    trigger('float', [
      state('in', style({transform: 'translateY(0)'})),
      transition(':enter', [
        style({transform: 'translateY(-50px)'}),
        animate('1000ms ease-out')
      ])
    ]),
    trigger('pulse', [
      state('in', style({transform: 'scale(1)'})),
      transition(':enter', [
        style({transform: 'scale(0.8)'}),
        animate('300ms ease-in-out', style({transform: 'scale(1.1)'})),
        animate('200ms ease-in-out', style({transform: 'scale(1)'}))
      ])
    ])
  ]
})
export class PageNotFoundComponent {
  constructor(
    private router:Router
  ) {

  }

  goHome() {
    this.router.navigate([`/${RoutePaths.home}`]);
  }
}
