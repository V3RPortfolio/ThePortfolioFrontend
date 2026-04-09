import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthResponse, GoogleOAuth2CallbackParams } from '../../interfaces/backend/auth.interface';
import { AuthenticationService } from '../../services/authentication.service';
import { RoutePaths } from '../../app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /** True when this component is rendered at the OAuth2 callback URL */
  isOAuth2Callback = false;
  callbackLoading = false;
  callbackError: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const code  = params.get('code');
      const state = params.get('state') ?? undefined;
      const scope = params.get('scope') ?? undefined;
      const error = params.get('error');
      const googleOauth2Redirecturl = `${window.location.origin}/${RoutePaths.oauth2CallbackGoogle}`;

      if (error) {
        this.isOAuth2Callback = true;
        this.callbackError = `Google sign-in was denied or failed: ${error}`;
        return;
      }

      if (code) {
        this.isOAuth2Callback = true;
        this.callbackLoading = true;

        const callbackPayload: GoogleOAuth2CallbackParams = { code, state, scope, redirect: googleOauth2Redirecturl };

        this.authService.fetchAccessToken(callbackPayload)
          .pipe(finalize(() => (this.callbackLoading = false)))
          .subscribe({
            next: (_res: AuthResponse) => {
              // Tokens are already stored by the service via tap(setTokens)
              this.router.navigateByUrl(`/${RoutePaths.admin}/`).then(() => {
                window.location.reload();
              });
            },
            error: (err: any) => {
              this.callbackError =
                err?.error?.message || err?.message || 'Authentication failed. Please try again.';
            }
          });
      }
    });
  }

  onLoggedIn(_res: AuthResponse): void {
    this.router.navigateByUrl('/');
  }
}
