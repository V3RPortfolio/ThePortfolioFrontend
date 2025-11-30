import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthResponse } from '../../interfaces/backend/auth.interface';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RoutePaths } from '../../app.constants';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  @Output() loggedIn = new EventEmitter<AuthResponse>();

  constructor(
    private auth: AuthenticationService, 
    private route:Router
  ) {}

  onSubmit() {
    if (!this.username || !this.password || this.loading) {
      return;
    }
    this.errorMessage = null;
    this.loading = true;

    this.auth
      .login({ username: this.username, password: this.password })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.loggedIn.emit(res);
          this.route.navigateByUrl(`/${RoutePaths.admin}`)
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Login failed';
          this.errorMessage = msg;
        },
      });
  }
}
