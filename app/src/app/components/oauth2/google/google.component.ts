import { Component } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { RoutePaths } from '../../../app.constants';



@Component({
  selector: 'app-google',
  templateUrl: './google.component.html',
  styleUrl: './google.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class GoogleComponent {
  loading: boolean = false;

  constructor(private authService: AuthenticationService) {}

  onSignInWithGoogle(): void {
    if (this.loading) return;
    this.loading = true;

    this.authService.fetchRedirectUrl()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (payload) => {
          // Parse the URL returned by the backend
          const googleUrl = new URL(payload.redirect_url);
          console.log('Fetched Google OAuth2 redirect URL:', googleUrl.toString());

          // Override redirect_uri so Google sends the callback to the
          // frontend instead of the backend
          const frontendCallbackUrl =
            `${window.location.origin}/${RoutePaths.oauth2CallbackGoogle}`;
          googleUrl.searchParams.set('redirect_uri', frontendCallbackUrl);
          console.log('Modified Google OAuth2 URL with frontend callback:', googleUrl.toString());

          // Navigate the browser to Google's OAuth2 consent page
          window.location.href = googleUrl.toString();
        },
        error: (err) => {
          console.error('Failed to fetch Google OAuth2 redirect URL', err);
        }
      });
  }
}
