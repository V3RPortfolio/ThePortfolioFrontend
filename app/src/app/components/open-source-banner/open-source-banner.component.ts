import { Component } from '@angular/core';
import { fadeInEnterFromLeft } from '../../services/triggers.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { infrastructureRepoUrl } from '../../app.constants';

@Component({
    selector: 'app-open-source-banner',
    templateUrl: './open-source-banner.component.html',
    styleUrl: './open-source-banner.component.scss',
    animations: [
        fadeInEnterFromLeft(1000, { marginLeft: '-100px' }, { marginLeft: '0' })
    ],
    standalone: true,
    imports: [MatButton, MatIcon]
})
export class OpenSourceBannerComponent {
    infraUrl = infrastructureRepoUrl;
    viewPage(page) {
        window.open(page, '_blank');
    }
}
