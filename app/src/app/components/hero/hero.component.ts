import { Component } from '@angular/core';
import { fadeIn, fadeInEnterFromRight } from '../../services/triggers.service';

@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.scss',
    animations: [
        fadeIn(),
        fadeInEnterFromRight()
    ],
    standalone: true
})
export class HeroComponent {

}
